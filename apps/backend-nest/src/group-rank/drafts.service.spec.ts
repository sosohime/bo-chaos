import { ConflictException } from '@nestjs/common';
import { GroupRankDraftService } from './drafts.service';
import { normalizeDefinition } from './definitions';

const definition = {
  name: '卧推重量',
  unit: 'kg',
  aggregate: 'latest' as const,
  direction: 'desc' as const,
  period: 'all_time' as const,
};
describe('moderated rule drafts', () => {
  let service: GroupRankDraftService;
  let prisma: any;
  let auth: any;
  let content: any;
  beforeEach(() => {
    prisma = {
      groupRankUser: { upsert: jest.fn().mockResolvedValue({ id: 'user-a' }) },
      groupRankDraft: {
        findUnique: jest.fn().mockResolvedValue(null),
        upsert: jest
          .fn()
          .mockImplementation(({ create }) => ({ ...create, id: 'draft-a' })),
        findFirst: jest.fn(),
      },
    };
    auth = {
      exchangeCode: jest.fn().mockResolvedValue({
        appId: 'wx-test',
        openId: 'openid-a',
        sessionKey: 'never-return-this',
      }),
    };
    content = { text: jest.fn().mockResolvedValue('trace') };
    service = new GroupRankDraftService(prisma, auth, content, {} as any);
  });
  it('persists approved rules only, without creating a group or returning owner credentials', async () => {
    const result = await service.create('fresh-code', definition, 'retry');
    expect(content.text).toHaveBeenCalledWith(
      '卧推重量\n单位：kg',
      'openid-a',
      4,
    );
    expect(result.template.aggregate).toBe('latest');
    expect(JSON.stringify(result)).not.toMatch(
      /openid-a|never-return-this|user-a/,
    );
    expect(prisma.groupRankDraft.upsert).toHaveBeenCalledTimes(1);
  });
  it('does not persist rules when content review fails', async () => {
    content.text.mockRejectedValue(new Error('review unavailable'));
    await expect(service.create('code', definition, 'retry')).rejects.toThrow(
      'review unavailable',
    );
    expect(prisma.groupRankDraft.upsert).not.toHaveBeenCalled();
  });
  it('compares retries independent of JSONB property order and rejects changed rules', async () => {
    prisma.groupRankDraft.findUnique.mockResolvedValue({
      id: 'draft-a',
      expiresAt: null,
      definition: {
        period: 'all_time',
        direction: 'desc',
        aggregate: 'latest',
        unit: 'kg',
        name: '卧推重量',
      },
    });
    await expect(
      service.create('code', definition, 'retry'),
    ).resolves.toMatchObject({ id: 'draft-a' });
    expect(content.text).not.toHaveBeenCalled();
    await expect(
      service.create('code', { ...definition, name: '游戏分数' }, 'retry'),
    ).rejects.toBeInstanceOf(ConflictException);
  });
  it.each([
    ['尿酸', 'μmol/L'],
    ['尿酸', 'µmol/L'],
    ['尿酸', 'umol/L'],
    ['血糖', 'mmol/L'],
    ['胆固醇', 'mg/dL'],
    ['血压记录', 'mmHg'],
    ['体重', 'kg'],
    ['BMI', ''],
  ])(
    'saves %s (%s) after the same content review as other custom rules',
    async (name, unit) => {
      const result = await service.create(
        'code',
        { ...definition, name, unit },
        'retry',
      );
      expect(content.text).toHaveBeenCalledWith(
        `${name}\n单位：${unit.normalize('NFKC') || '无'}`,
        'openid-a',
        4,
      );
      expect(result.template).toMatchObject({
        name,
        unit: unit.normalize('NFKC'),
      });
      expect(prisma.groupRankDraft.upsert).toHaveBeenCalledTimes(1);
    },
  );
  it('does not bypass content review for a health-themed draft', async () => {
    content.text.mockRejectedValue(new Error('review rejected'));
    await expect(
      service.create(
        'code',
        { ...definition, name: '尿酸', unit: 'μmol/L' },
        'retry',
      ),
    ).rejects.toThrow('review rejected');
    expect(prisma.groupRankDraft.upsert).not.toHaveBeenCalled();
  });
  it('normalizes units, rejects invisible names and unsupported executable rules', () => {
    expect(normalizeDefinition({ ...definition, unit: '㎏' }).unit).toBe('kg');
    expect(() =>
      normalizeDefinition({ ...definition, name: '卧\u200b推' }),
    ).toThrow();
    expect(() =>
      normalizeDefinition({ ...definition, aggregate: 'eval' as any }),
    ).toThrow();
  });
  it('does not return an expired or another-app draft', async () => {
    prisma.groupRankDraft.findFirst.mockResolvedValue(null);
    await expect(service.get('foreign')).rejects.toThrow('已过期');
    prisma.groupRankDraft.findFirst.mockResolvedValue({
      id: 'draft-a',
      expiresAt: new Date(0),
    });
    await expect(service.get('expired')).rejects.toThrow('已过期');
  });
});
