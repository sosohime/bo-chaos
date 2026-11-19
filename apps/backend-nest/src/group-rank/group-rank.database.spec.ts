import { GroupRankBackgroundService } from './background.service';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp = require('sharp');
import { createCipheriv } from 'node:crypto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/library/prisma.service';
import {
  GroupRankAuthService,
  type GroupRankIdentity,
} from './group-auth.service';
import { GroupRankService } from './group-rank.service';
import { getOfficialTemplate, periodStart } from './templates';
import { GroupRankDraftService } from './drafts.service';
import { GroupRankProfileService } from './profile.service';
import { GroupRankProxyService } from './proxy.service';

const databaseUrl = process.env.GROUP_RANK_TEST_DATABASE_URL;
const databaseTests = databaseUrl ? describe : describe.skip;

databaseTests('group ranking on an isolated PostgreSQL instance', () => {
  const originalEnv = process.env;
  const appId = 'wx-isolated-database-test';
  const key = Buffer.alloc(16, 7);
  const iv = Buffer.alloc(16, 3);
  let prisma: PrismaService;
  let service: GroupRankService;
  let auth: GroupRankAuthService;
  let fetchSpy: jest.SpyInstance;
  let a: GroupRankIdentity;
  let a2: GroupRankIdentity;
  let b: GroupRankIdentity;

  function payload(group: string) {
    const cipher = createCipheriv('aes-128-cbc', key, iv);
    return Buffer.concat([
      cipher.update(
        JSON.stringify({
          opengid: group,
          watermark: { appid: appId, timestamp: Math.floor(Date.now() / 1000) },
        }),
      ),
      cipher.final(),
    ]).toString('base64');
  }
  async function enter(code: string, group: string) {
    const result = await auth.enter(
      code,
      payload(group),
      iv.toString('base64'),
    );
    return auth.verify(result.accessToken);
  }

  beforeAll(async () => {
    const url = new URL(databaseUrl!);
    if (
      url.hostname !== 'localhost' ||
      url.pathname !== '/group_rank_test' ||
      !url.searchParams.get('host')?.startsWith('/tmp/gr-db-')
    ) {
      throw new Error(
        'Integration tests require a dedicated /tmp/gr-db-* Unix-socket PostgreSQL instance',
      );
    }
    process.env = {
      ...originalEnv,
      GROUP_RANK_APP_ID: appId,
      GROUP_RANK_APP_SECRET: 'test-only',
      GROUP_RANK_JWT_SECRET: 'test-only-group-ranking-secret-32-characters',
    };
    prisma = new PrismaService({ datasources: { db: { url: databaseUrl! } } });
    await prisma.$connect();
    service = new GroupRankService(prisma, {} as any);
    auth = new GroupRankAuthService(prisma);
    fetchSpy = jest.spyOn(global, 'fetch').mockImplementation(async (input) => {
      const code = new URL(String(input)).searchParams.get('js_code');
      return new Response(
        JSON.stringify({
          openid: code?.startsWith('repeat-')
            ? 'test-user-a'
            : `test-user-${code}`,
          session_key: key.toString('base64'),
        }),
      );
    });
    a = await enter('a', 'group-a');
    a2 = await enter('a2', 'group-a');
    b = await enter('b', 'group-b');
    await prisma.groupRankUser.updateMany({
      data: {
        nickname: '测试群友',
        avatarKey: '00000000-0000-4000-8000-000000000001.jpg',
      },
    });
  });
  afterAll(async () => {
    fetchSpy?.mockRestore();
    await prisma?.$disconnect();
    process.env = originalEnv;
  });

  it('serializes singleton races, permits revision edits, and blocks proxy claim collisions', async () => {
    const content = { text: jest.fn().mockResolvedValue('trace') } as any;
    const drafts = new GroupRankDraftService(prisma, auth, content, {} as any);
    const draft = await drafts.create(
      'draft-singleton',
      {
        name: '单笔测试',
        unit: '分',
        entryMode: 'single',
        aggregate: 'sum',
        direction: 'desc',
        period: 'all_time',
      },
      'singleton-draft',
    );
    const board = await service.createFromDraft(a, draft.id, 'singleton-races');
    expect(board.template).toMatchObject({ entryMode: 'single', aggregate: 'latest' });
    const results = await Promise.allSettled([
      service.submit(a,board.id,'10','single-a'), service.submit(a,board.id,'11','single-b'),
    ]);
    expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1);
    expect(await prisma.groupRankEntry.count({where:{boardId:board.id,deletedAt:null}})).toBe(1);
    const original = (await service.detail(a,board.id)).myEntries[0];
    const stored = await prisma.groupRankEntry.findUniqueOrThrow({where:{id:original.id}});
    expect((await service.submit(a,board.id,original.value,stored.requestId)).id).toBe(original.id);
    await service.edit(a,board.id,original.id,'12',original.revision);
    expect(Number((await service.detail(a, board.id)).ranking[0].score)).toBe(12);
    const proxy = new GroupRankProxyService(prisma,{text:jest.fn().mockResolvedValue(undefined)} as any);
    const person = await proxy.submit(a,board.id,{name:'待认领测试',value:'9',requestId:'single-proxy'});
    const retry = await proxy.submit(a,board.id,{name:'待认领测试',value:'9',requestId:'single-proxy'});
    expect(retry.id).toBe(person.id);
    const extra = await Promise.allSettled([
      proxy.submit(a,board.id,{participantId:person.participantId,value:'8',requestId:'extra-a'}),
      proxy.submit(a,board.id,{participantId:person.participantId,value:'7',requestId:'extra-b'}),
    ]);
    expect(extra.every(r=>r.status==='rejected')).toBe(true);
    await expect(proxy.claim(a,board.id,person.participantId)).rejects.toThrow('认领记录冲突');
    expect((await service.detail(a, board.id)).proxyParticipants![0].claimantUserId).toBeNull();
    expect((await proxy.entries(a,board.id,person.participantId))).toHaveLength(1);
    await proxy.claim(a2,board.id,person.participantId);
    const late = await service.submit(a2, board.id, '15', 'after-request');
    await expect(proxy.review(a,board.id,person.participantId,true,a2.userId)).rejects.toThrow('认领记录冲突');
    expect((await service.detail(a, board.id)).proxyParticipants![0].claimantUserId).toBe(a2.userId);
    await service.remove(a2, board.id, late.id);
    await proxy.review(a,board.id,person.participantId,true,a2.userId);
    await expect(service.submit(a2,board.id,'15','after-claim')).rejects.toThrow('每人一笔');
    const claimed = (await service.detail(a2,board.id)).myEntries[0];
    await service.edit(a2,board.id,claimed.id,'13',claimed.revision);
    await service.remove(a2,board.id,claimed.id);
    await expect(service.submit(a2,board.id,'14','after-delete')).resolves.toMatchObject({value:'14'});
  });

  it('automatically reuses a group, separates another group and deduplicates concurrent creation', async () => {
    expect(a.spaceId).toBe(a2.spaceId);
    expect(a.spaceId).not.toBe(b.spaceId);
    expect((await service.currentGroup(a)).memberCount).toBe(2);
    const boards = await Promise.all(
      Array.from({ length: 5 }, () =>
        service.createBoard(a, 'game-score', 'concurrent-board'),
      ),
    );
    expect(new Set(boards.map((board) => board.id)).size).toBe(1);
  });

  it('persists, edits, ranks and clears values without allowing deleted-request replay', async () => {
    const board = await service.createBoard(a, 'game-score', 'history-board');
    const lower = await service.submit(a, board.id, '100', 'lower');
    const higher = await service.submit(a, board.id, '200', 'higher');
    const other = await service.submit(a2, board.id, '200', 'other');
    expect(
      (await service.detail(a, board.id)).ranking.map((row) => row.rank),
    ).toEqual([1, 1]);
    await service.edit(a, board.id, higher.id, '150', higher.revision);
    expect(
      (await service.detail(a, board.id)).ranking.map((row) => row.score),
    ).toEqual(['200', '150']);
    await service.remove(a2, board.id, other.id);
    const result = await service.detail(a, board.id);
    expect(result.ranking.map((row) => [row.score, row.rank])).toEqual([
      ['150', 1],
    ]);
    expect(result.myEntries.map((entry) => entry.id)).toEqual(
      expect.arrayContaining([lower.id, higher.id]),
    );
    const deleted = await prisma.groupRankEntry.findUniqueOrThrow({
      where: { id: other.id },
    });
    expect(deleted.value).toBeNull();
    expect(deleted.deletedAt).not.toBeNull();
    await expect(service.submit(a2, board.id, '200', 'other')).rejects.toThrow(
      '已删除',
    );
    await expect(
      service.edit(a, board.id, higher.id, '999', 1),
    ).rejects.toThrow('已发生变化');
  });

  it('handles concurrent first group entries and repeat logins without duplicate identities', async () => {
    const identities = await Promise.all(
      Array.from({ length: 5 }, (_, index) =>
        enter(`fresh-${index}`, 'new-concurrent-group'),
      ),
    );
    expect(new Set(identities.map((identity) => identity.spaceId)).size).toBe(
      1,
    );
    expect((await service.currentGroup(identities[0])).memberCount).toBe(5);
    const repeats = await Promise.all(
      Array.from({ length: 5 }, (_, index) =>
        enter(`repeat-${index}`, 'group-a'),
      ),
    );
    expect(new Set(repeats.map((identity) => identity.userId))).toEqual(
      new Set([a.userId]),
    );
    expect((await service.currentGroup(a)).memberCount).toBe(2);
  });

  it('serializes concurrent retries of one score without duplicate entries', async () => {
    const board = await service.createBoard(
      a,
      'game-score',
      'concurrent-score-board',
    );
    const entries = await Promise.all(
      Array.from({ length: 5 }, () =>
        service.submit(a, board.id, '100', 'same-submission'),
      ),
    );
    expect(new Set(entries.map((entry) => entry.id)).size).toBe(1);
    expect(
      await prisma.groupRankEntry.count({ where: { boardId: board.id } }),
    ).toBe(1);
  });

  it('denies foreign-group access using actual stored board ownership', async () => {
    const board = await service.createBoard(a, 'game-score', 'isolation-board');
    const entry = await service.submit(a, board.id, '200', 'private');
    await expect(service.detail(b, board.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(
      service.submit(b, board.id, '300', 'intrusion'),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      service.edit(b, board.id, entry.id, '300', 1),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.remove(b, board.id, entry.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(
      (
        await prisma.groupRankEntry.findUniqueOrThrow({
          where: { id: entry.id },
        })
      ).value?.toString(),
    ).toBe('200');
  });

  it('aggregates exact decimals only in the current Shanghai month', async () => {
    const board = await service.createBoard(
      a,
      'running-distance',
      'month-board',
    );
    const start = periodStart(getOfficialTemplate('running-distance'))!;
    await prisma.groupRankEntry.createMany({
      data: [
        { boardId: board.id, userId: a.userId, requestId: 'd1', value: '0.1' },
        { boardId: board.id, userId: a.userId, requestId: 'd2', value: '0.2' },
        {
          boardId: board.id,
          userId: a.userId,
          requestId: 'old',
          value: '999',
          createdAt: new Date(start.getTime() - 1000),
        },
      ],
    });
    expect((await service.detail(a, board.id)).ranking[0].score).toBe('0.30');
  });

  it('lets a committed pause win over a submission waiting on the same board lock', async () => {
    const board = await service.createBoard(a, 'game-score', 'locked-board');
    let release: () => void = () => {};
    let locked: () => void = () => {};
    const lockReady = new Promise<void>((resolve) => {
      locked = resolve;
    });
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    const pausing = prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT "id" FROM "GroupRankBoard" WHERE "id" = ${board.id} FOR UPDATE`;
      locked();
      await held;
      await tx.groupRankBoard.update({
        where: { id: board.id },
        data: { status: 'paused' },
      });
    });
    await lockReady;
    const submitting = service.submit(a, board.id, '100', 'waiting');
    const rejected =
      expect(submitting).rejects.toBeInstanceOf(ForbiddenException);
    release();
    await pausing;
    await rejected;
    expect(
      await prisma.groupRankEntry.count({ where: { boardId: board.id } }),
    ).toBe(0);
  });

  it('enforces database-level status and deletion/value consistency', async () => {
    const board = await service.createBoard(
      a,
      'game-score',
      'constraint-board',
    );
    await expect(
      prisma.groupRankEntry.create({
        data: {
          boardId: board.id,
          userId: a.userId,
          requestId: 'invalid-null',
          value: null,
        },
      }),
    ).rejects.toThrow();
    await expect(
      prisma.groupRankBoard.update({
        where: { id: board.id },
        data: { status: 'not-a-status' },
      }),
    ).rejects.toThrow();
  });
  it('creates moderated uric-acid boards in each group, ranks latest records and preserves history on edits', async () => {
    const content = { text: jest.fn().mockResolvedValue('trace') } as any;
    const drafts = new GroupRankDraftService(prisma, auth, content, {} as any);
    const draft = await drafts.create(
      'draft-author',
      {
        name: '尿酸',
        unit: 'μmol/L',
        aggregate: 'latest',
        direction: 'desc',
        period: 'all_time',
      },
      'custom-draft',
    );
    expect(
      await prisma.groupRankMember.count({
        where: { user: { openId: 'test-user-draft-author' } },
      }),
    ).toBe(0);
    const [first, second] = await Promise.all([
      service.createFromDraft(a, draft.id, 'custom-a'),
      service.createFromDraft(a, draft.id, 'custom-a'),
    ]);
    expect(first.id).toBe(second.id);
    const other = await service.createFromDraft(b, draft.id, 'custom-b');
    expect(first.id).not.toBe(other.id);
    expect(
      (
        await prisma.groupRankDraft.findUniqueOrThrow({
          where: { id: draft.id },
        })
      ).expiresAt,
    ).toBeNull();
    expect(first.template).toMatchObject({ name: '尿酸', unit: 'μmol/L' });
    const old = await service.submit(a, first.id, '300', 'old');
    const recent = await service.submit(a, first.id, '100', 'recent');
    await prisma.groupRankEntry.update({
      where: { id: old.id },
      data: { createdAt: new Date('2026-01-01T00:00:00Z') },
    });
    await service.submit(a2, first.id, '200', 'other');
    const profiles = new GroupRankProfileService(prisma, content);
    await profiles.save(a, '小王');
    let detail = await service.detail(a, first.id);
    expect(detail.ranking.find((row) => row.userId === a.userId)).toMatchObject(
      { score: '100.000', displayName: '小王', rank: 2 },
    );
    await service.edit(a, first.id, old.id, '900', old.revision);
    expect(
      (await service.detail(a, first.id)).ranking.find(
        (row) => row.userId === a.userId,
      )?.score,
    ).toBe('100.000');
    await service.remove(a, first.id, recent.id);
    expect(
      (await service.detail(a, first.id)).ranking.find(
        (row) => row.userId === a.userId,
      )?.score,
    ).toBe('900.000');
    expect((await service.detail(b, other.id)).ranking).toEqual([]);
    await expect(service.detail(b, first.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.report(b, first.id, 'privacy')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('deduplicates reports, restricts removal to the creator and keeps removed-score tombstones', async () => {
    const board = await service.createBoard(a, 'game-score', 'remove-board');
    await service.submit(a2, board.id, '12', 'remove-score');
    await Promise.all([
      service.report(a2, board.id, 'privacy'),
      service.report(a2, board.id, 'privacy'),
    ]);
    expect(
      await prisma.groupRankReport.count({ where: { boardId: board.id } }),
    ).toBe(1);
    await expect(service.removeBoard(a2, board.id)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    await service.removeBoard(a, board.id);
    await expect(service.detail(a, board.id)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(
      service.createBoard(a, 'game-score', 'remove-board'),
    ).rejects.toThrow('已移除');
    expect(
      (await service.currentGroup(a)).boards.some((row) => row.id === board.id),
    ).toBe(false);
    expect(
      await prisma.groupRankEntry.count({
        where: { boardId: board.id, value: { not: null } },
      }),
    ).toBe(0);
    expect(
      await prisma.groupRankEntry.count({
        where: { boardId: board.id, deletedAt: { not: null } },
      }),
    ).toBe(1);
  });
  it('blocks numeric contributions without both profile fields while allowing reads and deletion', async () => {
    const board = await service.createBoard(
      b,
      'game-score',
      'profile-requirement',
    );
    const score = await service.submit(b, board.id, '10', 'before-clear');
    await prisma.groupRankUser.update({
      where: { id: b.userId },
      data: { nickname: null },
    });
    try {
      await expect(
        service.submit(b, board.id, '12', 'missing-name'),
      ).rejects.toThrow('先设置头像和昵称');
      await expect(
        service.edit(b, board.id, score.id, '12', score.revision),
      ).rejects.toThrow('先设置头像和昵称');
      await expect(service.detail(b, board.id)).resolves.toMatchObject({
        id: board.id,
      });
      await expect(service.remove(b, board.id, score.id)).resolves.toEqual({
        deleted: true,
      });
      await prisma.groupRankUser.update({
        where: { id: b.userId },
        data: { nickname: '测试群友', avatarKey: null },
      });
      await expect(
        service.submit(b, board.id, '12', 'missing-avatar'),
      ).rejects.toThrow('先设置头像和昵称');
    } finally {
      await prisma.groupRankUser.update({
        where: { id: b.userId },
        data: {
          nickname: '测试群友',
          avatarKey: '00000000-0000-4000-8000-000000000001.jpg',
        },
      });
    }
  });
  it('records unregistered names without fake users, moderates names and deduplicates retries', async () => {
    const content = { text: jest.fn().mockResolvedValue(null) } as any;
    const proxy = new GroupRankProxyService(prisma, content);
    const board = await service.createBoard(a, 'game-score', 'proxy-names');
    const usersBefore = await prisma.groupRankUser.count();
    const input = { name: '老王', value: '12', requestId: 'proxy-one' };
    const first = await proxy.submit(a, board.id, input);
    const retries = await Promise.all(
      Array.from({ length: 3 }, () => proxy.submit(a, board.id, input)),
    );
    expect(retries.every((row) => row.id === first.id)).toBe(true);
    expect(await prisma.groupRankUser.count()).toBe(usersBefore);
    expect(content.text).toHaveBeenCalledWith('老王', expect.any(String), 1);
    const sameName = await proxy.submit(a, board.id, {
      ...input,
      requestId: 'same-name',
    });
    expect(sameName.participantId).not.toBe(first.participantId);
    const detail = await service.detail(a2, board.id);
    expect(detail.ranking).toHaveLength(2);
    expect(detail.ranking[0]).toMatchObject({
      pendingClaim: true,
      avatarVersion: null,
      displayName: '老王',
      recordedById: a.userId,
    });
    await expect(
      proxy.submit(a, board.id, { ...input, value: '13' }),
    ).rejects.toThrow('不能更换');
    content.text.mockRejectedValueOnce(new Error('moderation unavailable'));
    await expect(
      proxy.submit(a, board.id, { ...input, requestId: 'rejected' }),
    ).rejects.toThrow('moderation unavailable');
    expect(
      await prisma.groupRankProxyParticipant.count({
        where: { boardId: board.id },
      }),
    ).toBe(2);
  });
  it('requires creator authority and group scope for all proxy writes, history and reviews', async () => {
    const content = { text: jest.fn().mockResolvedValue(null) } as any;
    const proxy = new GroupRankProxyService(prisma, content);
    const board = await service.createBoard(a, 'game-score', 'proxy-auth');
    const input = { name: '小李', value: '10', requestId: 'proxy-auth-score' };
    await expect(proxy.submit(a2, board.id, input)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    await expect(proxy.submit(b, board.id, input)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(content.text).not.toHaveBeenCalled();
    const entry = await proxy.submit(a, board.id, input);
    await expect(
      proxy.entries(a2, board.id, entry.participantId),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      proxy.edit(a2, board.id, entry.id, '20', 1),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(proxy.remove(a2, board.id, entry.id)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    await expect(
      proxy.claim(b, board.id, entry.participantId),
    ).rejects.toBeInstanceOf(NotFoundException);
    await proxy.claim(a2, board.id, entry.participantId);
    await expect(
      proxy.review(a2, board.id, entry.participantId, true, a2.userId),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      proxy.review(b, board.id, entry.participantId, true, a2.userId),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      proxy.review(a, board.id, entry.participantId, true, a.userId),
    ).rejects.toThrow('申请已变化');
    await proxy.review(a, board.id, entry.participantId, false, a2.userId);
    expect(
      (await service.detail(a, board.id)).proxyParticipants![0].claimantUserId,
    ).toBeNull();
    await proxy.claim(a, board.id, entry.participantId);
    await expect(
      proxy.review(a, board.id, entry.participantId, true, a2.userId),
    ).rejects.toThrow('申请已变化');
  });
  it('transfers a claim exactly once with recorder, original time and values; then the owner maintains it', async () => {
    const proxy = new GroupRankProxyService(prisma, {
      text: jest.fn().mockResolvedValue(null),
    } as any);
    const board = await service.createBoard(
      a,
      'running-distance',
      'proxy-claim',
    );
    const self = await service.submit(a2, board.id, '1', 'own-first');
    const first = await proxy.submit(a, board.id, {
      name: '小周',
      value: '2',
      requestId: 'claim-first',
    });
    const second = await proxy.submit(a, board.id, {
      participantId: first.participantId,
      value: '3',
      requestId: 'claim-second',
    });
    await proxy.claim(a2, board.id, first.participantId);
    await Promise.all(
      Array.from({ length: 3 }, () =>
        proxy.review(a, board.id, first.participantId, true, a2.userId),
      ),
    );
    const detail = await service.detail(a2, board.id);
    expect(detail.ranking).toHaveLength(1);
    expect(detail.ranking[0]).toMatchObject({
      userId: a2.userId,
      score: '6.00',
      recordedById: a.userId,
    });
    expect(detail.proxyParticipants).toEqual([]);
    expect(detail.myEntries.find((row) => row.id === first.id)).toMatchObject({
      createdAt: first.createdAt,
      value: '2',
      recordedById: a.userId,
    });
    expect(detail.myEntries.map((row) => row.id)).toEqual(
      expect.arrayContaining([self.id, first.id, second.id]),
    );
    expect(
      await prisma.groupRankProxyEntry.count({
        where: { participantId: first.participantId, value: { not: null } },
      }),
    ).toBe(0);
    await expect(proxy.edit(a, board.id, first.id, '9', 1)).rejects.toThrow(
      '已认领',
    );
    await expect(
      proxy.submit(a, board.id, {
        participantId: first.participantId,
        value: '9',
        requestId: 'after-claim',
      }),
    ).rejects.toThrow('已认领');
    await service.edit(a2, board.id, first.id, '4', 1);
    expect((await service.detail(a2, board.id)).ranking[0].score).toBe('8.00');
    await service.remove(a2, board.id, first.id);
    expect((await service.detail(a2, board.id)).ranking[0].score).toBe('4.00');
  });
  it('keeps pending claims private, serializes competing claims and honors pause/delete tombstones', async () => {
    const proxy = new GroupRankProxyService(prisma, {
      text: jest.fn().mockResolvedValue(null),
    } as any);
    const board = await service.createBoard(a, 'game-score', 'proxy-races');
    const row = await proxy.submit(a, board.id, {
      name: '小赵',
      value: '10',
      requestId: 'races',
    });
    await proxy.claim(a2, board.id, row.participantId);
    await expect(proxy.claim(a, board.id, row.participantId)).rejects.toThrow(
      '已有群友',
    );
    const third = await enter('proxy-observer', 'group-a');
    expect(
      (await service.detail(third, board.id)).proxyParticipants![0],
    ).toMatchObject({ claimantUserId: null, claimantName: null });
    expect(
      (await service.detail(a, board.id)).proxyParticipants![0].claimantUserId,
    ).toBe(a2.userId);
    await proxy.edit(a, board.id, row.id, '12', 1);
    await expect(proxy.edit(a, board.id, row.id, '15', 1)).rejects.toThrow(
      '已变化',
    );
    await service.setStatus(a, board.id, 'paused');
    await expect(
      proxy.submit(a, board.id, {
        participantId: row.participantId,
        value: '15',
        requestId: 'paused',
      }),
    ).rejects.toThrow('暂停');
    await proxy.remove(a, board.id, row.id);
    expect((await service.detail(a, board.id)).ranking).toEqual([]);
    await service.removeBoard(a, board.id);
    await expect(
      proxy.claim(a2, board.id, row.participantId),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(
      await prisma.groupRankProxyEntry.count({
        where: { boardId: board.id, value: { not: null } },
      }),
    ).toBe(0);
  });
  it('lets a creator proxy with incomplete profile without ever modifying their identity, while claims require a profile', async () => {
    const proxy = new GroupRankProxyService(prisma, {
      text: jest.fn().mockResolvedValue(null),
    } as any);
    const board = await service.createBoard(a, 'game-score', 'proxy-profile');
    const before = await prisma.groupRankUser.findUniqueOrThrow({
      where: { id: a.userId },
    });
    await prisma.groupRankUser.update({
      where: { id: a.userId },
      data: { nickname: null, avatarKey: null },
    });
    try {
      const row = await proxy.submit(a, board.id, {
        name: '群友别名',
        value: '1',
        requestId: 'no-actor-profile',
      });
      await proxy.edit(a, board.id, row.id, '2', 1);
      const unchanged = await prisma.groupRankUser.findUniqueOrThrow({
        where: { id: a.userId },
      });
      expect(unchanged.nickname).toBeNull();
      expect(unchanged.avatarKey).toBeNull();
      expect((await service.detail(a, board.id)).myProfile).toMatchObject({
        nickname: null,
        avatarVersion: null,
      });
      expect((await service.detail(a, board.id)).ranking[0]).toMatchObject({
        displayName: '群友别名',
        pendingClaim: true,
      });
      await prisma.groupRankUser.update({
        where: { id: a2.userId },
        data: { avatarKey: null },
      });
      try {
        await expect(
          proxy.claim(a2, board.id, row.participantId),
        ).rejects.toThrow('先设置头像和昵称');
      } finally {
        await prisma.groupRankUser.update({
          where: { id: a2.userId },
          data: { avatarKey: before.avatarKey },
        });
      }
    } finally {
      await prisma.groupRankUser.update({
        where: { id: a.userId },
        data: { nickname: before.nickname, avatarKey: before.avatarKey },
      });
    }
    const fullBefore = await prisma.groupRankUser.findUniqueOrThrow({
      where: { id: a.userId },
    });
    await proxy.submit(a, board.id, {
      name: '另一个群友',
      value: '3',
      requestId: 'full-actor-profile',
    });
    const fullAfter = await prisma.groupRankUser.findUniqueOrThrow({
      where: { id: a.userId },
    });
    expect(fullAfter).toEqual(fullBefore);
  });
  it('keeps latest submission order on claim and prevents retrying a deleted proxy score', async () => {
    const proxy = new GroupRankProxyService(prisma, {
      text: jest.fn().mockResolvedValue(null),
    } as any);
    const board = await service.createBoard(a, 'game-score', 'proxy-latest');
    await prisma.groupRankBoard.update({
      where: { id: board.id },
      data: { templateSnapshot: JSON.parse(JSON.stringify({ ...board.template, aggregate: 'latest' })) },
    });
    const old = await proxy.submit(a, board.id, {
      name: '小孙',
      value: '99',
      requestId: 'proxy-old',
    });
    await prisma.groupRankProxyEntry.update({
      where: { id: old.id },
      data: { createdAt: new Date('2025-01-01T00:00:00Z') },
    });
    await service.submit(a2, board.id, '5', 'newer-self');
    const removed = await proxy.submit(a, board.id, {
      participantId: old.participantId,
      value: '8',
      requestId: 'proxy-deleted',
    });
    await proxy.remove(a, board.id, removed.id);
    await expect(
      proxy.submit(a, board.id, {
        participantId: old.participantId,
        value: '8',
        requestId: 'proxy-deleted',
      }),
    ).rejects.toThrow('已认领或删除');
    await proxy.claim(a2, board.id, old.participantId);
    await proxy.review(a, board.id, old.participantId, true, a2.userId);
    expect((await service.detail(a2, board.id)).ranking[0].score).toBe('5');
  });
  it('persists controlled board themes separately from rules and denies foreign/non-creator changes', async () => {
    const board = await service.createBoard(a, 'game-score', 'arena-theme');
    expect(board.themeId).toBe('volt');
    await expect(
      service.setAppearance(a2, board.id, 'midnight'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.setAppearance(b, board.id, 'coral'),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      service.setAppearance(a, board.id, 'https://untrusted.invalid'),
    ).rejects.toThrow('支持的主题');
    const changed = await service.setAppearance(a, board.id, 'midnight');
    expect(changed.themeId).toBe('midnight');
    expect(changed.template).toEqual(board.template);
    const colored = await service.setAppearance(a, board.id, 'midnight', undefined, '#f65d9b');
    expect(colored.accentColor).toBe('#F65D9B');
    expect(colored.template).toEqual(board.template);
    expect((await service.detail(a, board.id)).accentColor).toBe('#F65D9B');
    expect((await service.currentGroup(a)).boards.find(row => row.id === board.id)?.accentColor).toBe('#F65D9B');
    await expect(service.setAppearance(a2, board.id, 'midnight', undefined, '#398AFF')).rejects.toBeInstanceOf(ForbiddenException);
    await expect(service.setAppearance(b, board.id, 'midnight', undefined, '#398AFF')).rejects.toBeInstanceOf(NotFoundException);
    await expect(prisma.groupRankBoard.update({where:{id:board.id},data:{accentColor:'red'}})).rejects.toThrow();
    await service.setAppearance(a, board.id, 'midnight', undefined, null);
    expect((await service.detail(a, board.id)).accentColor).toBeNull();

    expect((await service.detail(a, board.id)).themeId).toBe('midnight');
    expect(
      (await service.currentGroup(a)).boards.find((row) => row.id === board.id)
        ?.themeId,
    ).toBe('midnight');
    await expect(
      prisma.groupRankBoard.update({
        where: { id: board.id },
        data: { themeId: 'arbitrary' },
      }),
    ).rejects.toThrow();
    const drafts = new GroupRankDraftService(prisma, auth, {
      text: jest.fn().mockResolvedValue(null),
    } as any, {} as any);
    const draft = await drafts.create(
      'theme-author',
      {
        name: '游戏挑战',
        unit: '分',
        aggregate: 'latest',
        direction: 'desc',
        period: 'all_time',
        themeId: 'coral',
        accentColor: '#43ddc3',
      },
      'theme-draft',
    );
    expect(draft.template.themeId).toBe('coral');
    expect(draft.template.accentColor).toBe('#43DDC3');
    const activated = await service.createFromDraft(a, draft.id, 'theme-from-draft');
    expect(activated.accentColor).toBe('#43DDC3');
    expect((await service.detail(a, activated.id)).accentColor).toBe('#43DDC3');
    expect(
      (await service.createFromDraft(a, draft.id, 'theme-from-draft')).themeId,
    ).toBe('coral');
  });
  it('summarizes real leaders, decimal rules, proxies and all tied winners in a single group-scoped query', async () => {
    const board = await service.createBoard(a, 'game-score', 'arena-summary');
    await service.submit(a, board.id, '12', 'champion-a');
    await service.submit(a2, board.id, '12', 'champion-b');
    const proxy = new GroupRankProxyService(prisma, {
      text: jest.fn().mockResolvedValue(null),
    } as any);
    const pending = await proxy.submit(a, board.id, {
      name: '待认领冠军',
      value: '12',
      requestId: 'champion-proxy',
    });
    await proxy.submit(a, board.id, {
      name: '又一位并列',
      value: '12',
      requestId: 'champion-fourth',
    });
    await proxy.submit(a, board.id, {
      name: '第五位',
      value: '1',
      requestId: 'fifth',
    });
    let item = (await service.currentGroup(a)).boards.find(
      (row) => row.id === board.id,
    )!;
    expect(item.summary).toMatchObject({ participantCount: 5, winnerCount: 4 });
    expect(item.summary!.leaders).toHaveLength(3);
    expect(
      item.summary!.leaders.every(
        (row) => row.rank === 1 && row.score === '12',
      ),
    ).toBe(true);
    expect(item.summary!.leaders.some((row) => row.pendingClaim)).toBe(true);
    expect(
      (await service.currentGroup(b)).boards.some((row) => row.id === board.id),
    ).toBe(false);
    await proxy.claim(a2, board.id, pending.participantId);
    await proxy.review(a, board.id, pending.participantId, true, a2.userId);
    item = (await service.currentGroup(a)).boards.find(
      (row) => row.id === board.id,
    )!;
    expect(item.summary).toMatchObject({ participantCount: 4, winnerCount: 3 });
    await service.removeBoard(a, board.id);
    expect(
      (await service.currentGroup(a)).boards.some((row) => row.id === board.id),
    ).toBe(false);
  });
  it('keeps summary equal to detail for latest, ascending and Shanghai month filtering', async () => {
    for (const aggregate of ['latest', 'sum', 'max'] as const) {
      const board = await service.createBoard(
        a,
        'running-distance',
        `summary-${aggregate}`,
      );
      const template = {
        ...board.template,
        aggregate,
        direction: 'asc' as const,
      };
      await prisma.groupRankBoard.update({
        where: { id: board.id },
        data: { templateSnapshot: JSON.parse(JSON.stringify(template)) },
      });
      const old = await service.submit(a, board.id, '100', `old-${aggregate}`);
      await prisma.groupRankEntry.update({
        where: { id: old.id },
        data: { createdAt: new Date(periodStart(template)!.getTime() - 1000) },
      });
      await service.submit(a, board.id, '1', `one-${aggregate}`);
      await service.submit(a, board.id, '2', `two-${aggregate}`);
      await service.submit(a2, board.id, '1.5', `other-${aggregate}`);
      const proxy = new GroupRankProxyService(prisma, {
        text: jest.fn().mockResolvedValue(null),
      } as any);
      await proxy.submit(a, board.id, {
        name: '待认领',
        value: '3',
        requestId: `proxy-${aggregate}`,
      });
      const detail = await service.detail(a, board.id);
      const summary = (await service.currentGroup(a)).boards.find(
        (row) => row.id === board.id,
      )!.summary!;
      expect(
        summary.leaders.map((row) => [row.userId, row.score, row.rank]),
      ).toEqual(
        detail.ranking
          .slice(0, 3)
          .map((row) => [row.userId, row.score, row.rank]),
      );
      expect(summary.participantCount).toBe(3);
    }
  });
  it('persists moderated image appearance through draft, board and group reads with isolated access', async () => {
    const root = await mkdtemp(join(tmpdir(),'gr-db-bg-'));
    process.env.GROUP_RANK_AVATAR_ROOT=root;
    try {
      const content={image:jest.fn().mockResolvedValue(null),text:jest.fn().mockResolvedValue(null)};
      const backgrounds=new GroupRankBackgroundService(prisma,auth,content as any);
      const boards=new GroupRankService(prisma,backgrounds);
      const drafts=new GroupRankDraftService(prisma,auth,content as any,backgrounds);
      const asset=await backgrounds.upload('a','background-real-db',{buffer:await sharp({create:{width:400,height:900,channels:3,background:'#24f'}}).png().toBuffer()} as any);
      const background={...asset,cover:{x:.2,y:.8,zoom:1.3},card:{x:.8,y:.3,zoom:1},dim:.45};
      const draft=await drafts.create('a',{name:'背景测试',unit:'分',aggregate:'latest',direction:'desc',period:'all_time',background},'bg-draft');
      expect(draft.template.background).toEqual(background);
      const board=await boards.createFromDraft(a,draft.id,'bg-board');
      const published = (await boards.detail(a, board.id)).background!;
      expect(published).toMatchObject(background);
      expect((await boards.currentGroup(a)).boards.find(row => row.id === board.id)?.background).toEqual(published);
      const thumb = await backgrounds.board(a, board.id, asset.assetId, 'card', published.renditions!.card);
      expect(await sharp(thumb).metadata()).toMatchObject({ width: 144, height: 144 });
      await expect(backgrounds.board(b, board.id, asset.assetId, 'card', published.renditions!.card)).rejects.toThrow('本群');
      await expect(boards.setAppearance(a2,board.id,'coral',background)).rejects.toThrow('创建者');
      const shared=await boards.createFromDraft(b,draft.id,'bg-shared-board');
      expect((await boards.setAppearance(b,shared.id,'coral',{...background,dim:.6})).background?.dim).toBe(.6);
      const unrelated=await boards.createFromDraft(b,draft.id,'bg-unrelated-board');
      await boards.setAppearance(b,unrelated.id,'volt',null);
      await expect(boards.setAppearance(b,unrelated.id,'volt',background)).rejects.toThrow('自己上传');
      expect((await boards.detail(b,unrelated.id)).background).toBeNull();
      await expect(backgrounds.board(b,unrelated.id)).rejects.toThrow('没有自定义');
      expect((await drafts.get(draft.id)).template.background).toEqual(background);
      const singleConnectionUrl = new URL(databaseUrl!);
      singleConnectionUrl.searchParams.set('connection_limit', '1');
      const single = new PrismaService({
        datasources: { db: { url: singleConnectionUrl.toString() } },
      });
      try {
        const singleBackgrounds = new GroupRankBackgroundService(single, auth, content as any);
        const singleBoards = new GroupRankService(single, singleBackgrounds);
        const updated = (await singleBoards.setAppearance(a, board.id, 'coral', {
          ...background, dim: .65, card: { x: .5, y: .5, zoom: 1.7 },
        })).background!;
        expect(updated.dim).toBe(.65);
        expect(updated.renditions!.cover).toBe(published.renditions!.cover);
        expect(updated.renditions!.card).not.toBe(published.renditions!.card);
        await expect(singleBackgrounds.board(a, board.id, asset.assetId, 'card', published.renditions!.card)).rejects.toThrow('已更新');
        const cold = new GroupRankBackgroundService(single, auth, content as any);
        const rendered = await cold.board(a, board.id, asset.assetId, 'card', updated.renditions!.card);
        expect(await sharp(rendered).metadata()).toMatchObject({ width: 144, height: 144 });
      } finally {
        await single.$disconnect();
      }
    } finally { delete process.env.GROUP_RANK_AVATAR_ROOT;await rm(root,{recursive:true,force:true}); }
  });

});
