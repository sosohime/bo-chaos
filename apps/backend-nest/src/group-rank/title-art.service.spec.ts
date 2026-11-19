import { GroupRankTitleArtService } from './title-art.service';
import * as renderer from './title-art-renderer';
import { supportsTitle } from './title-art-font';
import sharp = require('sharp');

describe('group-scoped configurable title art', () => {
  const identity = { userId: 'member', spaceId: 'group-a' };
  let prisma: any;
  let titles: GroupRankTitleArtService;
  beforeEach(() => {
    prisma = {
      groupRankBoard: {
        findFirst: jest.fn(({ where }) =>
          Promise.resolve(
            where.spaceId === 'group-a' && where.id === 'board'
              ? { templateSnapshot: { name: '尿酸王' } }
              : null,
          ),
        ),
      },
    };
    titles = new GroupRankTitleArtService(prisma);
  });
  afterEach(() => jest.restoreAllMocks());
  it('renders arbitrary supported names with real transparency and different glyphs', async () => {
    const results = await Promise.all(
      [
        '尿酸王',
        '夜跑冠军',
        'Moon & <Star>',
        '我们这个群里所有人的周末运动成绩排行榜',
      ].map((name) => renderer.renderTitleArt(name)),
    );
    expect(new Set(results.map((r) => r.image.toString('base64'))).size).toBe(
      4,
    );
    for (const result of results) {
      const { data, info } = await sharp(result.image)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      expect(info.width).toBe(result.width);
      expect(info.height).toBe(result.height);
      expect(info.width).toBeGreaterThan(0);
      expect(info.width).toBeLessThanOrEqual(1024);
      expect(info.height).toBeGreaterThan(100);
      expect(info.height).toBeLessThan(2048);
      expect(data[3]).toBe(0);
      expect(data.some((v, index) => index % 4 === 3 && v > 0)).toBe(true);
    }
  });
  it('returns the actual name as text fallback for unsupported characters rather than replacement glyphs', async () => {
    expect(await supportsTitle('尿酸王')).toBe(true);
    expect(await supportsTitle('Moon & <Star>')).toBe(true);
    expect(await supportsTitle('🏆尿酸王')).toBe(false);
    prisma.groupRankBoard.findFirst.mockResolvedValue({
      templateSnapshot: { name: '🏆尿酸王' },
    });
    expect(await titles.get(identity, 'board')).toMatchObject({
      name: '🏆尿酸王',
      imageDataUri: null,
    });
  });
  it('coalesces rendering but rechecks group/deletion access on every request, even cached', async () => {
    const spy = jest.spyOn(renderer, 'renderTitleArt');
    const [first, second] = await Promise.all([
      titles.get(identity, 'board'),
      titles.get(identity, 'board'),
    ]);
    expect(first).toBe(second);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(await titles.get(identity, 'board')).toBe(first);
    expect(spy).toHaveBeenCalledTimes(1);
    await expect(
      titles.get({ ...identity, spaceId: 'group-b' }, 'board'),
    ).rejects.toThrow('本群中没有');
    prisma.groupRankBoard.findFirst.mockResolvedValue(null);
    await expect(titles.get(identity, 'board')).rejects.toThrow('本群中没有');
    expect(prisma.groupRankBoard.findFirst).toHaveBeenCalledWith({
      where: { id: 'board', spaceId: 'group-a', deletedAt: null },
      select: { templateSnapshot: true },
    });
    expect(spy).toHaveBeenCalledTimes(1);
  });
  it('does not retain failed renders, so later reads can retry', async () => {
    jest
      .spyOn(renderer, 'renderTitleArt')
      .mockRejectedValueOnce(new Error('renderer unavailable'));
    await expect(titles.get(identity, 'board')).rejects.toThrow(
      'renderer unavailable',
    );
    await expect(titles.get(identity, 'board')).resolves.toMatchObject({
      name: '尿酸王',
    });
  });
});
