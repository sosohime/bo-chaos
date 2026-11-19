import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@mono/prisma-client';
import { PrismaService } from '@/library/prisma.service';
import { GroupRankService } from './group-rank.service';
import { getOfficialTemplate } from './templates';

describe('current-group isolation and score writes', () => {
  const identity = { userId: 'user-a', spaceId: 'group-a' };
  let prisma: any;
  let service: GroupRankService;
  let board: any;
  let entry: any;
  beforeEach(() => {
    board = {
      id: 'board-a',
      spaceId: 'group-a',
      creatorId: 'user-a',
      status: 'open',
      templateId: 'game-score',
      templateSnapshot: getOfficialTemplate('game-score'),
    };
    entry = {
      id: 'entry-a',
      boardId: 'board-a',
      userId: 'user-a',
      requestId: 'request-a',
      value: new Prisma.Decimal(100),
      deletedAt: null,
      revision: 1,
      createdAt: new Date('2026-10-26T02:00:00Z'),
    };
    prisma = {
      $queryRaw: jest.fn().mockResolvedValue([]),
      groupRankBoard: {
        findFirst: jest.fn(({ where }) =>
          Promise.resolve(
            where.spaceId === board.spaceId && where.id === board.id
              ? board
              : null,
          ),
        ),
        findMany: jest.fn().mockResolvedValue([board]),
        upsert: jest.fn().mockResolvedValue(board),
        update: jest.fn().mockResolvedValue(board),
      },
      groupRankUser: {
        findUnique: jest
          .fn()
          .mockResolvedValue({
            id: 'user-a',
            nickname: '小王',
            avatarKey: '00000000-0000-4000-8000-000000000001.jpg',
          }),
        findMany: jest.fn().mockResolvedValue([]),
      },
      groupRankMember: { count: jest.fn().mockResolvedValue(2) },
      groupRankProxyParticipant: { findMany: jest.fn().mockResolvedValue([]) },
      groupRankProxyEntry: { findMany: jest.fn().mockResolvedValue([]), groupBy: jest.fn().mockResolvedValue([]) },
      groupRankEntry: {
        groupBy: jest.fn().mockResolvedValue([
          {
            userId: 'user-a',
            _max: { value: new Prisma.Decimal(100) },
            _sum: { value: new Prisma.Decimal(100) },
          },
        ]),
        findMany: jest.fn().mockResolvedValue([entry]),
        findFirst: jest.fn().mockResolvedValue(entry),
        upsert: jest.fn().mockResolvedValue(entry),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
    };
    prisma.$transaction = jest.fn((operation) => operation(prisma));
    service = new GroupRankService(prisma as PrismaService, {} as any);
  });
  it('single mode rejects a second request but allows a retry and editing', async () => {
    board.templateSnapshot = {...board.templateSnapshot, entryMode:'single'};
    prisma.groupRankEntry.findFirst.mockResolvedValueOnce(null).mockResolvedValueOnce(entry);
    await expect(service.submit(identity, 'board-a', '100', 'second')).rejects.toThrow('每人一笔');
    expect(prisma.groupRankEntry.upsert).not.toHaveBeenCalled();
    prisma.groupRankEntry.findFirst.mockResolvedValue(entry);
    await expect(service.submit(identity, 'board-a', '100', 'request-a')).resolves.toMatchObject({id:'entry-a'});
    await expect(service.edit(identity, 'board-a', 'entry-a', '99', 1)).resolves.toEqual({updated:true});
  });
  it('never queries rankings or entries for a board from another group', async () => {
    const other = { ...identity, spaceId: 'group-b' };
    await expect(service.detail(other, 'board-a')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(
      service.submit(other, 'board-a', '100', 'req'),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      service.edit(other, 'board-a', 'entry-a', '100', 1),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      service.remove(other, 'board-a', 'entry-a'),
    ).rejects.toBeInstanceOf(NotFoundException);
    await expect(
      service.setStatus(other, 'board-a', 'paused'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.groupRankEntry.groupBy).not.toHaveBeenCalled();
    expect(prisma.groupRankEntry.upsert).not.toHaveBeenCalled();
    expect(prisma.groupRankEntry.updateMany).not.toHaveBeenCalled();
  });
  it('lists only the token group, without exposing WeChat identifiers', async () => {
    const result = await service.currentGroup(identity);
    expect(prisma.groupRankBoard.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { spaceId: 'group-a', deletedAt: null },
      }),
    );
    expect(result).not.toHaveProperty('openGid');
    expect(result.boards[0]).not.toHaveProperty('spaceId');
  });
  it('creates a board with a fixed official template snapshot and retry key', async () => {
    await service.createBoard(identity, 'game-score', 'req');
    expect(prisma.groupRankBoard.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          spaceId_creatorId_requestId: {
            spaceId: 'group-a',
            creatorId: 'user-a',
            requestId: 'req',
          },
        },
        create: expect.objectContaining({
          templateVersion: 1,
          templateSnapshot: getOfficialTemplate('game-score'),
        }),
      }),
    );
    await expect(
      service.createBoard(identity, 'unknown', 'req'),
    ).rejects.toThrow();
  });
  it.each([
    { nickname: null, avatarKey: 'avatar.jpg' },
    { nickname: '小王', avatarKey: null },
    { nickname: ' ', avatarKey: 'avatar.jpg' },
  ])('requires both profile fields for contributions %p', async (profile) => {
    prisma.groupRankUser.findUnique.mockResolvedValue(profile);
    await expect(
      service.submit(identity, 'board-a', '100', 'req'),
    ).rejects.toThrow('先设置头像和昵称');
    await expect(
      service.edit(identity, 'board-a', 'entry-a', '100', 1),
    ).rejects.toThrow('先设置头像和昵称');
    expect(prisma.groupRankEntry.upsert).not.toHaveBeenCalled();
    expect(prisma.groupRankEntry.updateMany).not.toHaveBeenCalled();
    await expect(
      service.remove(identity, 'board-a', 'entry-a'),
    ).resolves.toEqual({ deleted: true });
  });
  it('prevents duplicate submits from changing the first value', async () => {
    expect(
      (await service.submit(identity, 'board-a', '100', 'request-a')).value,
    ).toBe('100');
    await expect(
      service.submit(identity, 'board-a', '101', 'request-a'),
    ).rejects.toBeInstanceOf(ConflictException);
  });
  it('cannot replay a deleted entry or edit a stale revision', async () => {
    entry.deletedAt = new Date();
    entry.value = null;
    await expect(
      service.submit(identity, 'board-a', '100', 'request-a'),
    ).rejects.toBeInstanceOf(ConflictException);
    prisma.groupRankEntry.updateMany.mockResolvedValue({ count: 0 });
    await expect(
      service.edit(identity, 'board-a', 'entry-a', '100', 1),
    ).rejects.toBeInstanceOf(ConflictException);
  });
  it('never updates someone else’s entry', async () => {
    prisma.groupRankEntry.findFirst.mockResolvedValue(null);
    await expect(
      service.edit(identity, 'board-a', 'someone-else', '100', 1),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.groupRankEntry.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'someone-else',
        boardId: 'board-a',
        userId: 'user-a',
        deletedAt: null,
      },
    });
    expect(prisma.groupRankEntry.updateMany).not.toHaveBeenCalled();
  });
  it('blocks submissions while paused, but still permits deletion of one’s own values', async () => {
    board.status = 'paused';
    await expect(
      service.submit(identity, 'board-a', '100', 'req'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await service.remove(identity, 'board-a', 'entry-a');
    expect(prisma.groupRankEntry.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'entry-a',
          boardId: 'board-a',
          userId: 'user-a',
          deletedAt: null,
        },
        data: {
          value: null,
          deletedAt: expect.any(Date),
          revision: { increment: 1 },
        },
      }),
    );
  });
  it('only permits the creator to pause a board', async () => {
    await expect(
      service.setStatus({ ...identity, userId: 'user-b' }, 'board-a', 'paused'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.groupRankBoard.update).not.toHaveBeenCalled();
  });
  it('excludes deleted values and recomputes rankings on every read', async () => {
    const first = await service.detail(identity, 'board-a');
    expect(first.ranking[0].score).toBe('100');
    prisma.groupRankEntry.groupBy.mockResolvedValue([]);
    prisma.groupRankEntry.findMany.mockResolvedValue([]);
    expect((await service.detail(identity, 'board-a')).ranking).toEqual([]);
    expect(prisma.groupRankEntry.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { boardId: 'board-a', deletedAt: null },
      }),
    );
  });
});
