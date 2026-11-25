import { GroupRankBackgroundService } from './background.service';
import { normalizeBackground } from './background-contract';
import { backgroundRenditions } from './background-rendition';
import sharp = require('sharp');
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const choice = {
  assetId: '12345678-1234-4234-8234-123456789abc',
  cover: { x: 0.2, y: 0.8, zoom: 1.5 },
  card: { x: 1, y: 0, zoom: 1 },
  dim: 0.4,
};
describe('private moderated board backgrounds', () => {
  let root: string,
    service: GroupRankBackgroundService,
    prisma: any,
    content: any;
  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'gr-bg-'));
    process.env.GROUP_RANK_AVATAR_ROOT = root;
    process.env.GROUP_RANK_APP_ID = 'app';
    prisma = {
      groupRankUser: { upsert: jest.fn().mockResolvedValue({ id: 'author' }) },
      groupRankBackground: {
        findUnique: jest.fn().mockResolvedValue(null),
        findFirst: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn().mockImplementation(async ({ data }) => data),
      },
      groupRankBoard: { findFirst: jest.fn() },
      groupRankDraft: { findFirst: jest.fn() },
    };
    prisma.$transaction = async (operation: any) => operation(prisma);
    prisma.$queryRaw = jest.fn().mockResolvedValue([]);
    content = { image: jest.fn().mockResolvedValue(null) };
    service = new GroupRankBackgroundService(
      prisma,
      {
        exchangeCode: jest.fn().mockResolvedValue({
          appId: 'app',
          openId: 'open',
          sessionKey: 'must-never-persist',
        }),
      } as any,
      content,
    );
  });
  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
    delete process.env.GROUP_RANK_AVATAR_ROOT;
    delete process.env.GROUP_RANK_APP_ID;
  });
  const photo = async () =>
    ({
      buffer: await sharp({
        create: { width: 2000, height: 600, channels: 3, background: '#246' },
      })
        .png()
        .toBuffer(),
    }) as Express.Multer.File;
  it('bounds, re-encodes and reviews before persisting an immutable private image', async () => {
    const result = await service.upload('code', 'request', await photo());
    expect(result.imageWidth).toBe(1600);
    expect(result.imageHeight).toBe(480);
    expect(prisma.groupRankUser.upsert.mock.calls[0][0].create).toEqual({
      appId: 'app',
      openId: 'open',
    });
    expect(content.image).toHaveBeenCalledTimes(1);
    expect(content.image.mock.invocationCallOrder[0]).toBeLessThan(
      prisma.groupRankBackground.create.mock.invocationCallOrder[0],
    );
    expect(await readdir(join(root, 'backgrounds'))).toHaveLength(1);
    expect(Object.keys(result).sort()).toEqual([
      'assetId',
      'imageHeight',
      'imageWidth',
    ]);
  });
  it('writes nothing on failed moderation', async () => {
    content.image.mockRejectedValue(new Error('review unavailable'));
    await expect(
      service.upload('code', 'request', await photo()),
    ).rejects.toThrow('review unavailable');
    expect(prisma.groupRankBackground.create).not.toHaveBeenCalled();
    expect(await readdir(root)).toEqual([]);
  });
  it('cleans the new file after a failed DB write', async () => {
    prisma.groupRankBackground.create.mockRejectedValue(new Error('DB down'));
    await expect(
      service.upload('code', 'request', await photo()),
    ).rejects.toThrow('DB down');
    expect(await readdir(join(root, 'backgrounds'))).toEqual([]);
  });
  it('retries the same image idempotently, rejects a different image for that request', async () => {
    const file = await photo();
    await service.upload('code', 'request', file);
    const data = prisma.groupRankBackground.create.mock.calls[0][0].data;
    prisma.groupRankBackground.findUnique.mockResolvedValue(data);
    const second = await service.upload('code', 'request', file);
    expect(second.assetId).toBe(data.id);
    expect(content.image).toHaveBeenCalledTimes(1);
    await expect(
      service.upload('code', 'request', {
        buffer: await sharp({
          create: { width: 10, height: 10, channels: 3, background: '#f00' },
        })
          .png()
          .toBuffer(),
      } as any),
    ).rejects.toThrow('重新选择');
  });
  it('does not trust uploaded dimensions, crop bounds or foreign asset identifiers', async () => {
    const { assetId } = await service.upload('code', 'test-file', await photo());
    prisma.groupRankBackground.findFirst.mockResolvedValue(prisma.groupRankBackground.create.mock.calls[0][0].data);
    const input = { ...choice, assetId };
    expect(
      await service.resolve({ ...input, imageWidth: 999 } as any, 'author'),
    ).toEqual({ ...input, imageWidth: 1600, imageHeight: 480 });
    await expect(service.resolve(input, 'other')).rejects.toThrow('自己上传');
    await expect(
      service.resolve(
        { ...choice, cover: { x: -0.1, y: 0, zoom: 1 } },
        'author',
      ),
    ).rejects.toThrow('裁切');
    expect(normalizeBackground(null)).toBeNull();
  });
  it('permits recropping an already-bound approved shared asset', async () => {
    const { assetId } = await service.upload('code', 'shared', await photo());
    prisma.groupRankBackground.findFirst.mockResolvedValue({
      ...prisma.groupRankBackground.create.mock.calls[0][0].data,
      ownerId: 'original-author',
    });
    expect(
      (await service.resolve({ ...choice, assetId }, 'board-creator', assetId))?.assetId,
    ).toBe(assetId);
  });
  it('saves independent cropped pixels and refuses stale or out-of-group reads even when cached', async () => {
    const segments = Buffer.alloc(1500 * 700 * 3);
    for (let i = 0; i < segments.length; i += 3) {
      const x = (i / 3) % 1500;
      segments[i] = x < 750 ? 220 : 10;
      segments[i + 1] = ((i * 73) ^ (i >>> 8)) & 127;
      segments[i + 2] = x < 750 ? 10 : 220;
    }
    const file = {
      buffer: await sharp(segments, { raw: { width: 1500, height: 700, channels: 3 } })
        .jpeg().toBuffer(),
    } as Express.Multer.File;
    const { assetId } = await service.upload('code', 'photo', file);
    prisma.groupRankBackground.findFirst.mockResolvedValue(prisma.groupRankBackground.create.mock.calls[0][0].data);
    const background = (await service.resolve({
      ...choice, assetId, cover: { x: 0, y: 0, zoom: 1.6 }, card: { x: 1, y: 0, zoom: 1.4 },
    }, 'author'))!;
    const version = backgroundRenditions(background);
    const identity = { userId: 'a', spaceId: 'inside' };
    prisma.groupRankBoard.findFirst.mockResolvedValue({ background });
    const read = (slot: 'cover' | 'card') => service.board(identity, 'board', assetId, slot, version[slot]);
    prisma.groupRankBackground.findFirst.mockClear();
    const [cover, card] = await Promise.all([read('cover'), read('card')]);
    expect(prisma.groupRankBackground.findFirst).not.toHaveBeenCalled();

    const original = await service.board(identity, 'board', assetId);
    expect(await sharp(cover).metadata()).toMatchObject({ width: 938, height: 313 });
    expect(await sharp(card).metadata()).toMatchObject({ width: 144, height: 144 });
    expect(cover.length).toBeLessThan(original.length);
    expect(card.length).toBeLessThan(cover.length);
    const [coverPixel, cardPixel] = await Promise.all(
      [cover, card].map((buffer) => sharp(buffer).extract({ left: 50, top: 50, width: 1, height: 1 }).raw().toBuffer()),
    );
    expect(coverPixel[0]).toBeGreaterThan(coverPixel[2] + 120);
    expect(cardPixel[2]).toBeGreaterThan(cardPixel[0] + 120);
    const reframed = (await service.resolve({
      ...background, cover: { ...background.cover, x: 1 },
    }, 'author'))!;
    prisma.groupRankBoard.findFirst.mockResolvedValue({ background: reframed });
    await expect(read('cover')).rejects.toThrow('已更新');
    await expect(read('card')).resolves.toEqual(card);
    prisma.groupRankBoard.findFirst.mockResolvedValue(null);
    await expect(read('card')).rejects.toThrow('本群');
  });
  it('authorizes the current group before any file read', async () => {
    prisma.groupRankBoard.findFirst.mockResolvedValue(null);
    await expect(
      service.board({ userId: 'a', spaceId: 'outside' }, 'board'),
    ).rejects.toThrow('本群');
    expect(prisma.groupRankBackground.findFirst).not.toHaveBeenCalled();
    expect(prisma.groupRankBoard.findFirst).toHaveBeenCalledWith({
      where: { id: 'board', spaceId: 'outside', deletedAt: null },
      select: { background: true },
    });
  });
  it('rejects oversized input and unsafe image decoders', async () => {
    await expect(
      service.upload('code', 'request', {
        buffer: Buffer.alloc(4 * 1024 * 1024 + 1),
      } as any),
    ).rejects.toThrow('4MB');
    await expect(
      service.upload('code', 'request', {
        buffer: Buffer.from('<svg/>'),
      } as any),
    ).rejects.toThrow('普通');
    expect(content.image).not.toHaveBeenCalled();
  });
  it('normalizes EXIF rotation before reviewing or returning crop dimensions',async()=>{
    const file={buffer:await sharp({create:{width:300,height:100,channels:3,background:'#f70'}}).jpeg().withMetadata({orientation:6}).toBuffer()} as Express.Multer.File;
    const result=await service.upload('code','rotated',file);expect(result.imageWidth).toBe(100);expect(result.imageHeight).toBe(300);
    const reviewed=await sharp(content.image.mock.calls[0][0]).metadata();expect(reviewed.orientation).toBeUndefined();expect(reviewed.width).toBe(100);
  });

});
