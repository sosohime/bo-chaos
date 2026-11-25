import { PrismaService } from '@/library/prisma.service';
import { ServiceUnavailableException } from '@nestjs/common';
import { GroupRankHealthController } from './health.controller';

describe('group-ranking readiness', () => {
  const originalEnv = process.env;
  let prisma: any;
  let controller: GroupRankHealthController;
  beforeEach(() => {
    process.env = {
      ...originalEnv,
      GROUP_RANK_APP_ID: '',
      GROUP_RANK_APP_SECRET: '',
      GROUP_RANK_JWT_SECRET: '',
    };
    prisma = { $queryRaw: jest.fn().mockResolvedValue([{ ready: true }]) };
    controller = new GroupRankHealthController(prisma as PrismaService);
  });
  afterEach(() => {
    process.env = originalEnv;
  });
  it('reports partial readiness when the database works but WeChat is not configured', async () => {
    expect(await controller.health()).toEqual({
      data: {
        status: 'partial',
        database: 'ready',
        wechat: 'missing_credentials',
      },
    });
  });
  it('reports blocked readiness for missing tables or failed database access', async () => {
    prisma.$queryRaw.mockResolvedValueOnce([{ ready: false }]);
    await expect(controller.health()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    prisma.$queryRaw.mockRejectedValueOnce(new Error('database unavailable'));
    await expect(controller.health()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
  it('does not expose configured secret values', async () => {
    process.env.GROUP_RANK_APP_ID = 'test-app';
    process.env.GROUP_RANK_APP_SECRET = 'test-private-app-secret';
    process.env.GROUP_RANK_JWT_SECRET =
      'test-private-signing-secret-32-characters';
    const result = await controller.health();
    expect(result.data.status).toBe('ready');
    expect(JSON.stringify(result)).not.toContain('test-private');
  });
});
