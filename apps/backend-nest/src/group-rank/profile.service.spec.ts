import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import sharp = require('sharp');
import { GroupRankProfileService } from './profile.service';

describe('participant profile and private avatars', () => {
  let root: string;
  let user: any;
  let prisma: any;
  let content: any;
  let service: GroupRankProfileService;
  const identity = { userId: 'user-a', spaceId: 'space-a' };
  const previous = process.env.GROUP_RANK_AVATAR_ROOT;
  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'group-avatar-test-'));
    process.env.GROUP_RANK_AVATAR_ROOT = root;
    user = {
      id: 'user-a',
      openId: 'private-openid',
      nickname: null,
      avatarKey: null,
    };
    prisma = {
      groupRankUser: {
        findUnique: jest.fn(() => user),
        update: jest.fn(({ data }) => (user = { ...user, ...data })),
        updateMany: jest.fn(({ data }) => {
          user = { ...user, ...data };
          return { count: 1 };
        }),
      },
      groupRankMember: { findUnique: jest.fn(() => ({ user })) },
    };
    content = {
      text: jest.fn().mockResolvedValue('trace'),
      image: jest.fn().mockResolvedValue(undefined),
    };
    service = new GroupRankProfileService(prisma, content);
  });
  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
    if (previous === undefined) delete process.env.GROUP_RANK_AVATAR_ROOT;
    else process.env.GROUP_RANK_AVATAR_ROOT = previous;
  });
  it('supports an optional nickname, without returning raw WeChat identifiers', async () => {
    const result = await service.save(identity, '小王');
    expect(result).toEqual({
      userId: 'user-a',
      nickname: '小王',
      avatarVersion: null,
    });
    expect(content.text).toHaveBeenCalledWith('小王', 'private-openid', 1);
    expect(JSON.stringify(result)).not.toContain('private-openid');
    await expect(service.save(identity, '')).resolves.toMatchObject({
      nickname: null,
    });
  });
  it('does not update a profile when nickname review fails', async () => {
    content.text.mockRejectedValue(new Error('review'));
    await expect(service.save(identity, 'bad')).rejects.toThrow('review');
    expect(prisma.groupRankUser.update).not.toHaveBeenCalled();
  });
  it('reencodes and reviews an avatar before saving, then restricts reads to current-group members', async () => {
    const buffer = await sharp({
      create: { width: 32, height: 16, channels: 3, background: '#197551' },
    })
      .png()
      .toBuffer();
    const result = await service.save(identity, '小王', {
      buffer,
      originalname: '../../evil.png',
    } as Express.Multer.File);
    expect(result.avatarVersion).toMatch(/^[a-f0-9-]{36}\.jpg$/);
    const bytes = content.image.mock.calls[0][0];
    expect(await sharp(bytes).metadata()).toMatchObject({
      width: 256,
      height: 256,
      format: 'jpeg',
    });
    expect((await service.avatar(identity, 'user-a')).equals(bytes)).toBe(true);
    expect(prisma.groupRankMember.findUnique).toHaveBeenCalledWith({
      where: { spaceId_userId: { spaceId: 'space-a', userId: 'user-a' } },
      include: { user: true },
    });
    prisma.groupRankMember.findUnique.mockReturnValueOnce(null);
    await expect(
      service.avatar({ ...identity, spaceId: 'foreign' }, 'user-a'),
    ).rejects.toThrow('头像不存在');
    await service.clearAvatar(identity);
    expect(await readdir(root)).toEqual([]);
  });
  it('does not write unreviewed files, oversized images or executable formats', async () => {
    const buffer = await sharp({
      create: { width: 8, height: 8, channels: 3, background: '#fff' },
    })
      .jpeg()
      .toBuffer();
    content.image.mockRejectedValueOnce(new Error('image review'));
    await expect(
      service.save(identity, '', { buffer } as Express.Multer.File),
    ).rejects.toThrow('image review');
    await expect(
      service.save(identity, '', {
        buffer: Buffer.alloc(2 * 1024 * 1024 + 1),
      } as Express.Multer.File),
    ).rejects.toThrow('2MB');
    await expect(
      service.save(identity, '', {
        buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'),
      } as Express.Multer.File),
    ).rejects.toThrow('普通 JPG');
    expect(await readdir(root)).toEqual([]);
    expect(prisma.groupRankUser.update).not.toHaveBeenCalled();
  });
  it('cleans up a reviewed file when persistence fails', async () => {
    const buffer = await sharp({
      create: { width: 8, height: 8, channels: 3, background: '#fff' },
    })
      .jpeg()
      .toBuffer();
    prisma.groupRankUser.update.mockRejectedValueOnce(new Error('database'));
    await expect(
      service.save(identity, '', { buffer } as Express.Multer.File),
    ).rejects.toThrow('database');
    expect(await readdir(root)).toEqual([]);
  });
});
