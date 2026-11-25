import { createCipheriv } from 'node:crypto';
import { JwtService } from '@nestjs/jwt';
import {
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '@/library/prisma.service';
import { GroupRankAuthService, verifyGroupPayload } from './group-auth.service';

const appId = 'wx-group-rank-test';
const testSecret = 'group-rank-test-signing-key-32-characters';
const key = Buffer.alloc(16, 7);
const iv = Buffer.alloc(16, 3);

function encrypted(payload: unknown) {
  const cipher = createCipheriv('aes-128-cbc', key, iv);
  return Buffer.concat([
    cipher.update(JSON.stringify(payload), 'utf8'),
    cipher.final(),
  ]).toString('base64');
}
function validPayload(overrides: Record<string, unknown> = {}) {
  return {
    opengid: 'wechat-group-A',
    watermark: { appid: appId, timestamp: Math.floor(Date.now() / 1000) },
    ...overrides,
  };
}

describe('verified WeChat group source', () => {
  it('logs only a fixed rejection stage, without payloads or credentials', () => {
    const warn = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => {});
    try {
      expect(() =>
        verifyGroupPayload(
          'bad-cipher',
          iv.toString('base64'),
          key.toString('base64'),
          appId,
        ),
      ).toThrow(UnauthorizedException);
      expect(warn).toHaveBeenLastCalledWith(
        'group_source_rejected stage=cipher_shape',
      );
      expect(() =>
        verifyGroupPayload(
          encrypted(
            validPayload({
              watermark: {
                appid: 'wrong',
                timestamp: Math.floor(Date.now() / 1000),
              },
            }),
          ),
          iv.toString('base64'),
          key.toString('base64'),
          appId,
        ),
      ).toThrow(UnauthorizedException);
      expect(warn).toHaveBeenLastCalledWith(
        'group_source_rejected stage=app_id',
      );
      expect(() =>
        verifyGroupPayload(
          encrypted(validPayload({ watermark: null })),
          iv.toString('base64'),
          key.toString('base64'),
          appId,
        ),
      ).toThrow(UnauthorizedException);
      expect(warn).toHaveBeenLastCalledWith(
        'group_source_rejected stage=watermark',
      );
      expect(() =>
        verifyGroupPayload(
          encrypted(validPayload({ watermark: {} })),
          iv.toString('base64'),
          key.toString('base64'),
          appId,
        ),
      ).toThrow(UnauthorizedException);
      expect(warn).toHaveBeenLastCalledWith(
        'group_source_rejected stage=app_id_missing',
      );

      expect(() =>
        verifyGroupPayload(
          encrypted(
            validPayload({
              watermark: {
                appid: appId,
                timestamp: Math.floor(Date.now() / 1000) - 301,
              },
            }),
          ),
          iv.toString('base64'),
          key.toString('base64'),
          appId,
        ),
      ).toThrow(UnauthorizedException);
      expect(warn).toHaveBeenLastCalledWith(
        'group_source_rejected stage=expired',
      );
      expect(() =>
        verifyGroupPayload(
          encrypted(validPayload({ opengid: '' })),
          iv.toString('base64'),
          key.toString('base64'),
          appId,
        ),
      ).toThrow(UnauthorizedException);
      expect(warn).toHaveBeenLastCalledWith(
        'group_source_rejected stage=group_id',
      );
      expect(JSON.stringify(warn.mock.calls)).not.toContain('wechat-group-A');
      expect(JSON.stringify(warn.mock.calls)).not.toContain(
        key.toString('base64'),
      );
    } finally {
      warn.mockRestore();
    }
  });
  it('accepts legacy group-entry data containing only a decrypted opengid', () => {
    expect(
      verifyGroupPayload(
        encrypted({ opengid: 'wechat-group-A' }),
        iv.toString('base64'),
        key.toString('base64'),
        appId,
      ),
    ).toBe('wechat-group-A');
  });
  it.each([
    {},
    { open_single_roomid: 'single-room' },
    { opengid: '' },
    { opengid: 123 },
  ])(
    'rejects a payload without a usable decrypted group identifier %p',
    (payload) => {
      expect(() =>
        verifyGroupPayload(
          encrypted(payload),
          iv.toString('base64'),
          key.toString('base64'),
          appId,
        ),
      ).toThrow(UnauthorizedException);
    },
  );
  it('accepts the documented group-entry shape without a watermark using the login session key', () => {
    const payload = {
      opengid: 'wechat-group-A',
      open_single_roomid: '',
      group_openid: 'group-member-A',
      chat_type: 3,
    };
    expect(
      verifyGroupPayload(
        encrypted(payload),
        iv.toString('base64'),
        key.toString('base64'),
        appId,
      ),
    ).toBe('wechat-group-A');
    expect(() =>
      verifyGroupPayload(
        encrypted(payload),
        iv.toString('base64'),
        Buffer.alloc(16, 9).toString('base64'),
        appId,
      ),
    ).toThrow(UnauthorizedException);
  });
  it.each([
    { chat_type: 1 },
    { chat_type: '3' },
    { chat_type: 2 },
    { chat_type: null },
    { open_single_roomid: 'single-room' },
  ])('rejects explicit non-group chat data without watermark %p', (extra) => {
    expect(() =>
      verifyGroupPayload(
        encrypted({ opengid: 'wechat-group-A', ...extra }),
        iv.toString('base64'),
        key.toString('base64'),
        appId,
      ),
    ).toThrow(UnauthorizedException);
  });
  it('rejects a non-group chat even when its watermark is otherwise valid', () => {
    expect(() =>
      verifyGroupPayload(
        encrypted(validPayload({ chat_type: 1 })),
        iv.toString('base64'),
        key.toString('base64'),
        appId,
      ),
    ).toThrow(UnauthorizedException);
  });
  it('accepts only a fresh payload decrypted with the login session key', () => {
    expect(
      verifyGroupPayload(
        encrypted(validPayload()),
        iv.toString('base64'),
        key.toString('base64'),
        appId,
      ),
    ).toBe('wechat-group-A');
  });
  it.each([
    {
      watermark: {
        appid: 'another-app',
        timestamp: Math.floor(Date.now() / 1000),
      },
    },
    {
      watermark: {
        appid: appId,
        timestamp: Math.floor(Date.now() / 1000) - 301,
      },
    },
    {
      watermark: {
        appid: appId,
        timestamp: Math.floor(Date.now() / 1000) + 61,
      },
    },
    { watermark: { appid: appId, timestamp: '123' } },
    { opengid: '' },
    { opengid: 123 },
    { watermark: null },
  ])('rejects invalid group provenance %p', (overrides) => {
    expect(() =>
      verifyGroupPayload(
        encrypted(validPayload(overrides)),
        iv.toString('base64'),
        key.toString('base64'),
        appId,
      ),
    ).toThrow(UnauthorizedException);
  });
  it('rejects tampered ciphertext and a different session key', () => {
    const data = encrypted(validPayload());
    expect(() =>
      verifyGroupPayload(
        data,
        iv.toString('base64'),
        Buffer.alloc(16, 9).toString('base64'),
        appId,
      ),
    ).toThrow(UnauthorizedException);
    expect(() =>
      verifyGroupPayload(
        'not-encrypted',
        iv.toString('base64'),
        key.toString('base64'),
        appId,
      ),
    ).toThrow(UnauthorizedException);
  });
});

describe('group-scoped login', () => {
  const originalEnv = process.env;
  let prisma: any;
  let auth: GroupRankAuthService;
  let fetchSpy: jest.SpyInstance;
  beforeEach(() => {
    process.env = {
      ...originalEnv,
      GROUP_RANK_APP_ID: appId,
      GROUP_RANK_APP_SECRET: 'test-app-secret',
      GROUP_RANK_JWT_SECRET: testSecret,
    };
    prisma = {
      groupRankUser: { upsert: jest.fn().mockResolvedValue({ id: 'user-a' }) },
      groupRankSpace: {
        upsert: jest.fn().mockResolvedValue({ id: 'space-a' }),
      },
      groupRankMember: {
        upsert: jest.fn(),
        findUnique: jest
          .fn()
          .mockResolvedValue({ space: { appId }, user: { appId } }),
      },
    };
    prisma.$transaction = jest.fn((operation) => operation(prisma));
    auth = new GroupRankAuthService(prisma as PrismaService);
    fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          openid: 'user-openid',
          session_key: key.toString('base64'),
        }),
      ),
    );
  });
  afterEach(() => {
    process.env = originalEnv;
    jest.restoreAllMocks();
  });

  it('automatically provisions the verified group and member without approvals', async () => {
    const result = await auth.enter(
      'login-code',
      encrypted(validPayload()),
      iv.toString('base64'),
    );
    expect(result.expiresIn).toBe(900);
    expect(result.displayOpenGid).toBe('wechat-group-A');
    expect(await auth.verify(result.accessToken)).toEqual({
      userId: 'user-a',
      spaceId: 'space-a',
    });
    expect(prisma.groupRankSpace.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { appId_openGid: { appId, openGid: 'wechat-group-A' } },
      }),
    );
    expect(prisma.groupRankMember.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: { spaceId: 'space-a', userId: 'user-a' },
      }),
    );
    expect(JSON.stringify(result)).not.toContain('user-openid');
    expect(JSON.stringify(result)).not.toContain(key.toString('base64'));
  });
  it('provisions a legacy group only after login and keyed decryption succeed', async () => {
    const result = await auth.enter(
      'fresh-code',
      encrypted({ opengid: 'legacy-group-A' }),
      iv.toString('base64'),
    );
    expect(result.displayOpenGid).toBe('legacy-group-A');
    expect(prisma.groupRankSpace.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { appId_openGid: { appId, openGid: 'legacy-group-A' } },
      }),
    );
  });
  it('provisions only the group from a decrypted modern group-entry payload', async () => {
    await auth.enter(
      'fresh-code',
      encrypted({
        opengid: 'wechat-group-A',
        chat_type: 3,
        group_openid: 'member-A',
      }),
      iv.toString('base64'),
    );
    expect(prisma.groupRankSpace.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { appId_openGid: { appId, openGid: 'wechat-group-A' } },
      }),
    );
  });
  it('does not write any identities when the group payload cannot be verified', async () => {
    await expect(
      auth.enter(
        'code',
        encrypted(validPayload({ opengid: '' })),
        iv.toString('base64'),
      ),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
  it('refuses BoFans and another app tokens even when the signing key matches', async () => {
    const jwt = new JwtService();
    const token = jwt.sign(
      { sub: 'user-a', gid: 'space-a' },
      { secret: testSecret, issuer: 'bofans', audience: appId },
    );
    await expect(auth.verify(token)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    const otherApp = jwt.sign(
      { sub: 'user-a', gid: 'space-a' },
      { secret: testSecret, issuer: 'group-rank', audience: 'another-app' },
    );
    await expect(auth.verify(otherApp)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    expect(prisma.groupRankMember.findUnique).not.toHaveBeenCalled();
  });
  it('rejects expired sessions and removed participation', async () => {
    const expired = new JwtService().sign(
      { sub: 'user-a', gid: 'space-a' },
      {
        secret: testSecret,
        issuer: 'group-rank',
        audience: appId,
        expiresIn: -1,
      },
    );
    await expect(auth.verify(expired)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
    const session = await auth.enter(
      'code',
      encrypted(validPayload()),
      iv.toString('base64'),
    );
    prisma.groupRankMember.findUnique.mockResolvedValue(null);
    await expect(auth.verify(session.accessToken)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
  it('reports dependency failure separately from invalid identity', async () => {
    fetchSpy.mockRejectedValueOnce(new Error('network unavailable'));
    await expect(
      auth.enter('code', encrypted(validPayload()), iv.toString('base64')),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    const session = await auth.enter(
      'code',
      encrypted(validPayload()),
      iv.toString('base64'),
    );
    prisma.groupRankMember.findUnique.mockRejectedValueOnce(
      new Error('database unavailable'),
    );
    await expect(auth.verify(session.accessToken)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
  it('does not use old product credentials when independent credentials are absent', async () => {
    delete process.env.GROUP_RANK_APP_SECRET;
    await expect(
      auth.enter('code', encrypted(validPayload()), iv.toString('base64')),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
