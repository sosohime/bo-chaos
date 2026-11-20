import { GroupRankBackgroundService } from './background.service';
import { backgroundRenditions } from './background-rendition';
import type {
  GroupRankBackgroundChoice,
  GroupRankBackground,
} from '@mono/types';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/library/prisma.service';
import { Prisma } from '@mono/prisma-client';
import type {
  GroupRankBoardDetail,
  GroupRankBoardDto,
  GroupRankEntryDto,
  GroupRankSpaceDto,
  GroupRankTemplate,
} from '@mono/types';
import type { GroupRankIdentity } from './group-auth.service';
import { getOfficialTemplate, periodStart, validateScore } from './templates';
import { singleRecordScope } from './record-policy';
import { rankScores } from './ranking';
import { groupSummaries } from './summary';
import { customTemplate, findDraft, normalizeAccentColor } from './definitions';
import { mapProfile } from './profile.service';
import type { GroupRankDefinition } from '@mono/types';

type Board = {
  id: string;
  creatorId: string;
  status: string;
  templateSnapshot: Prisma.JsonValue;
  draftId?: string | null;
  themeId?: string;
  accentColor?: string | null;
  background?: Prisma.JsonValue;
  deletedAt?: Date | null;
};
const HISTORY_PAGE_SIZE = 30;

@Injectable()
export class GroupRankService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly backgrounds: GroupRankBackgroundService,
  ) {}

  private mapBoard(board: Board): GroupRankBoardDto {
    const background = board.background as unknown as GroupRankBackground | null;
    return {
      id: board.id,
      accentColor: board.accentColor || null,
      background: background
        ? { ...background, renditions: backgroundRenditions(background) }
        : null,
      themeId: (board.themeId || 'volt') as GroupRankBoardDto['themeId'],
      creatorId: board.creatorId,
      status: board.status as GroupRankBoardDto['status'],
      draftId: board.draftId || null,
      template: board.templateSnapshot as unknown as GroupRankTemplate,
    };
  }

  private async board(
    identity: GroupRankIdentity,
    boardId: string,
    client: Prisma.TransactionClient = this.prisma,
  ) {
    const board = await client.groupRankBoard.findFirst({
      where: { id: boardId, spaceId: identity.spaceId, deletedAt: null },
    });
    if (!board) throw new NotFoundException('本群没有这张榜单');
    return board;
  }

  private async withWritableBoard<T>(
    identity: GroupRankIdentity,
    boardId: string,
    operation: (tx: Prisma.TransactionClient, board: Board) => Promise<T>,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw(
        Prisma.sql`SELECT "id" FROM "GroupRankBoard" WHERE "id" = ${boardId} AND "spaceId" = ${identity.spaceId} FOR UPDATE`,
      );
      const board = await tx.groupRankBoard.findFirst({
        where: { id: boardId, spaceId: identity.spaceId, deletedAt: null },
      });
      if (!board) throw new NotFoundException('本群没有这张榜单');
      return operation(tx, board);
    });
  }

  async currentGroup(identity: GroupRankIdentity): Promise<GroupRankSpaceDto> {
    return this.prisma.$transaction(
      async (tx) => {
        const [boards, memberCount, profile] = await Promise.all([
          tx.groupRankBoard.findMany({
            where: { spaceId: identity.spaceId, deletedAt: null },
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          }),
          tx.groupRankMember.count({
            where: { spaceId: identity.spaceId },
          }),
          tx.groupRankUser.findUnique({ where: { id: identity.userId } }),
        ]);
        const summaries = await groupSummaries(tx, identity.spaceId, boards);
        return {
          id: identity.spaceId,
          myUserId: identity.userId,
          memberCount,
          ...(profile ? { myProfile: mapProfile(profile) } : {}),
          boards: boards.map((board) => ({
            ...this.mapBoard(board),
            summary: summaries.get(board.id),
          })),
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  }

  async createBoard(
    identity: GroupRankIdentity,
    templateId: string,
    requestId: string,
  ): Promise<GroupRankBoardDto> {
    const template = getOfficialTemplate(templateId);
    // Keep a non-empty update so concurrent retries use an atomic database upsert.
    const board = await this.prisma.groupRankBoard.upsert({
      where: {
        spaceId_creatorId_requestId: {
          spaceId: identity.spaceId,
          creatorId: identity.userId,
          requestId,
        },
      },
      create: {
        spaceId: identity.spaceId,
        creatorId: identity.userId,
        requestId,
        templateId: template.id,
        templateVersion: template.version,
        templateSnapshot: template as unknown as Prisma.InputJsonValue,
      },
      update: { requestId },
    });
    if (board.deletedAt)
      throw new ConflictException('这次创建的榜单已移除，请重新创建');
    if (board.templateId !== templateId)
      throw new ConflictException('同一次创建请求不能更换玩法');
    return this.mapBoard(board);
  }

  async detail(
    identity: GroupRankIdentity,
    boardId: string,
    cursor?: string,
  ): Promise<GroupRankBoardDetail> {
    return this.prisma.$transaction(
      async (tx) => {
        const board = await this.board(identity, boardId, tx);
        const template = this.mapBoard(board).template;
        if (!['max', 'sum', 'latest'].includes(template.aggregate))
          throw new BadRequestException('当前版本暂不支持这张榜单的计算规则');
        const start = periodStart(template);
        const where = {
          boardId,
          deletedAt: null,
          // timestamp(3) may round a just-written DB timestamp up by <1ms.
          ...(start
            ? { createdAt: { gte: start, lte: new Date(Date.now() + 1) } }
            : {}),
        };
        let scores: { userId: string; score: Prisma.Decimal }[];
        if (template.aggregate === 'latest') {
          const latest = await tx.groupRankEntry.findMany({
            where,
            distinct: ['userId'],
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            select: { userId: true, value: true },
          });
          scores = latest
            .filter((row) => row.value !== null)
            .map((row) => ({ userId: row.userId, score: row.value! }));
        } else {
          const groups = await tx.groupRankEntry.groupBy({
            by: ['userId'],
            where,
            _sum: { value: true },
            _max: { value: true },
          });
          scores = groups.map((group) => ({
            userId: group.userId,
            score: (template.aggregate === 'sum'
              ? group._sum.value
              : group._max.value)!,
          }));
        }
        const pending = await tx.groupRankProxyParticipant.findMany({
          where: { boardId, claimedUserId: null, entries: { some: { deletedAt: null } } },
          select: { id: true, displayName: true },
          orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        });
        const proxyWhere = { ...where, participant: { claimedUserId: null } };
        if (template.aggregate === 'latest') {
          const rows = await tx.groupRankProxyEntry.findMany({
            where: proxyWhere,
            distinct: ['participantId'],
            orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
            select: { participantId: true, value: true },
          });
          scores.push(
            ...rows
              .filter((row) => row.value !== null)
              .map((row) => ({
                userId: `proxy:${row.participantId}`,
                score: row.value!,
              })),
          );
        } else {
          const rows = await tx.groupRankProxyEntry.groupBy({
            by: ['participantId'],
            where: proxyWhere,
            _sum: { value: true },
            _max: { value: true },
          });
          scores.push(
            ...rows.map((row) => ({
              userId: `proxy:${row.participantId}`,
              score: (template.aggregate === 'sum'
                ? row._sum.value
                : row._max.value)!,
            })),
          );
        }
        const proxyById = new Map(
          pending.map((person) => [`proxy:${person.id}`, person]),
        );
        const recorded = await tx.groupRankEntry.findMany({
          where: { ...where, recordedById: { not: null } },
          select: { userId: true },
          distinct: ['userId'],
        });
        const recordedUsers = new Set(recorded.map((row) => row.userId));
        const people = await tx.groupRankUser.findMany({
          where: {
            id: {
              in: [
                ...new Set([
                  ...scores.map((row) => row.userId),
                  identity.userId,
                ]),
              ],
            },
          },
          select: { id: true, nickname: true, avatarKey: true },
        });
        const profiles = new Map(people.map((user) => [user.id, user]));
        const myProfile = profiles.get(identity.userId);
        if (cursor) {
          const entry = await tx.groupRankEntry.findFirst({
            where: {
              id: cursor,
              boardId,
              userId: identity.userId,
              deletedAt: null,
            },
            select: { id: true },
          });
          if (!entry)
            throw new BadRequestException('历史记录分页位置无效，请刷新');
        }
        const entries = await tx.groupRankEntry.findMany({
          where: { boardId, userId: identity.userId, deletedAt: null },
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          take: HISTORY_PAGE_SIZE + 1,
          ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        });
        const visible = entries.slice(0, HISTORY_PAGE_SIZE);
        return {
          ...this.mapBoard(board),
          proxyParticipants: pending,
          myUserId: identity.userId,
          ...(myProfile ? { myProfile: mapProfile(myProfile) } : {}),
          ranking: rankScores(scores, template).map((row) => ({
            ...row,
            displayName:
              proxyById.get(row.userId)?.displayName ||
              profiles.get(row.userId)?.nickname ||
              row.displayName,
            avatarVersion: profiles.get(row.userId)?.avatarKey || null,
            ...(proxyById.has(row.userId)
              ? {
                  participantId: proxyById.get(row.userId)!.id,
                  pendingClaim: true,
                  recordedById: board.creatorId,
                }
              : recordedUsers.has(row.userId)
                ? { recordedById: board.creatorId }
                : {}),
          })),
          myEntries: visible.map((entry) => this.mapEntry(entry)),
          historyHasMore: entries.length > HISTORY_PAGE_SIZE,
          historyNextCursor:
            entries.length > HISTORY_PAGE_SIZE
              ? visible[visible.length - 1].id
              : null,
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  }

  private mapEntry(entry: {
    id: string;
    value: Prisma.Decimal | null;
    revision: number;
    createdAt: Date;
    recordedById?: string | null;
  }): GroupRankEntryDto {
    if (!entry.value) throw new NotFoundException('这条成绩已删除');
    return {
      id: entry.id,
      ...(entry.recordedById ? { recordedById: entry.recordedById } : {}),
      value: entry.value.toString(),
      revision: entry.revision,
      createdAt: entry.createdAt.toISOString(),
    };
  }

  private async requireParticipantProfile(
    tx: Prisma.TransactionClient,
    userId: string,
  ) {
    const user = await tx.groupRankUser.findUnique({
      where: { id: userId },
      select: { nickname: true, avatarKey: true },
    });
    if (!user?.nickname?.trim() || !user.avatarKey)
      throw new ForbiddenException('请先设置头像和昵称，再提交或修改成绩');
  }

  async submit(
    identity: GroupRankIdentity,
    boardId: string,
    value: string,
    requestId: string,
  ): Promise<GroupRankEntryDto> {
    return this.withWritableBoard(identity, boardId, async (tx, board) => {
      if (board.status !== 'open')
        throw new ForbiddenException('榜单已暂停或关闭，暂不能提交');
      await this.requireParticipantProfile(tx, identity.userId);
      const score = validateScore(value, this.mapBoard(board).template);
      const template = this.mapBoard(board).template;
      if (template.entryMode === 'single') {
        const previous = await tx.groupRankEntry.findFirst({
          where: { boardId, userId: identity.userId, requestId },
        });
        if (!previous && await tx.groupRankEntry.findFirst({
          where: { boardId, userId: identity.userId, deletedAt: null, ...singleRecordScope(template) },
        })) throw new ConflictException('此榜每人一笔，请修改已有成绩');
      }
      const entry = await tx.groupRankEntry.upsert({
        where: {
          boardId_userId_requestId: {
            boardId,
            userId: identity.userId,
            requestId,
          },
        },
        create: { boardId, userId: identity.userId, requestId, value: score },
        update: {},
      });
      if (entry.deletedAt || !entry.value)
        throw new ConflictException('这次提交的成绩已删除，请重新填写');
      if (!entry.value.equals(score))
        throw new ConflictException('同一次提交请求不能更换成绩');
      return this.mapEntry(entry);
    });
  }

  async edit(
    identity: GroupRankIdentity,
    boardId: string,
    entryId: string,
    value: string,
    revision: number,
  ) {
    return this.withWritableBoard(identity, boardId, async (tx, board) => {
      if (board.status !== 'open')
        throw new ForbiddenException('榜单已暂停或关闭，暂不能修改');
      await this.requireParticipantProfile(tx, identity.userId);
      const score = validateScore(value, this.mapBoard(board).template);
      const entry = await tx.groupRankEntry.findFirst({
        where: {
          id: entryId,
          boardId,
          userId: identity.userId,
          deletedAt: null,
        },
      });
      if (!entry) throw new NotFoundException('没有找到你的这条成绩');
      const result = await tx.groupRankEntry.updateMany({
        where: {
          id: entryId,
          boardId,
          userId: identity.userId,
          revision,
          deletedAt: null,
        },
        data: { value: score, revision: { increment: 1 } },
      });
      if (result.count !== 1)
        throw new ConflictException('成绩已发生变化，请刷新后再修改');
      return { updated: true };
    });
  }

  async remove(identity: GroupRankIdentity, boardId: string, entryId: string) {
    return this.withWritableBoard(identity, boardId, async (tx) => {
      await tx.groupRankEntry.updateMany({
        where: {
          id: entryId,
          boardId,
          userId: identity.userId,
          deletedAt: null,
        },
        data: {
          value: null,
          deletedAt: new Date(),
          revision: { increment: 1 },
        },
      });
      return { deleted: true };
    });
  }

  async createFromDraft(
    identity: GroupRankIdentity,
    draftId: string,
    requestId: string,
  ): Promise<GroupRankBoardDto> {
    return this.prisma.$transaction(async (tx) => {
      const draft = await findDraft(
        tx,
        draftId,
        process.env.GROUP_RANK_APP_ID || '',
      );
      const { background, ...template } = customTemplate(
        draft.id,
        draft.definition as unknown as GroupRankDefinition,
      );
      const board = await tx.groupRankBoard.upsert({
        where: {
          spaceId_creatorId_requestId: {
            spaceId: identity.spaceId,
            creatorId: identity.userId,
            requestId,
          },
        },
        create: {
          spaceId: identity.spaceId,
          creatorId: identity.userId,
          requestId,
          draftId,
          themeId: template.themeId || 'volt',
          accentColor: template.accentColor || null,
          background: background
            ? (background as unknown as Prisma.InputJsonValue)
            : Prisma.DbNull,
          templateId: template.id,
          templateVersion: template.version,
          templateSnapshot: template as unknown as Prisma.InputJsonValue,
        },
        update: { requestId },
      });
      if (board.deletedAt || board.draftId !== draftId)
        throw new ConflictException('这次请求已使用或榜单已移除，请重新创建');
      await tx.groupRankDraft.update({
        where: { id: draftId },
        data: { expiresAt: null },
      });
      return this.mapBoard(board);
    });
  }

  async report(identity: GroupRankIdentity, boardId: string, reason: string) {
    if (!['inappropriate', 'privacy', 'other'].includes(reason))
      throw new BadRequestException('请选择举报原因');
    return this.withWritableBoard(identity, boardId, async (tx) => {
      await tx.groupRankReport.upsert({
        where: { boardId_reporterId: { boardId, reporterId: identity.userId } },
        create: { boardId, reporterId: identity.userId, reason },
        update: { reason },
      });
      return { reported: true };
    });
  }

  async removeBoard(identity: GroupRankIdentity, boardId: string) {
    return this.withWritableBoard(identity, boardId, async (tx, board) => {
      if (board.creatorId !== identity.userId)
        throw new ForbiddenException('只有创建者可以移除榜单');
      await tx.groupRankEntry.updateMany({
        where: { boardId, deletedAt: null },
        data: {
          value: null,
          deletedAt: new Date(),
          revision: { increment: 1 },
        },
      });
      await tx.groupRankProxyEntry.updateMany({
        where: { boardId, deletedAt: null },
        data: {
          value: null,
          deletedAt: new Date(),
          revision: { increment: 1 },
        },
      });
      await tx.groupRankBoard.update({
        where: { id: boardId },
        data: { deletedAt: new Date(), status: 'closed' },
      });
      return { removed: true };
    });
  }

  async setAppearance(
    identity: GroupRankIdentity,
    boardId: string,
    themeId: string,
    background?: GroupRankBackgroundChoice | null,
    accentColor?: string | null,
  ) {
    if (!['volt', 'midnight', 'coral'].includes(themeId))
      throw new BadRequestException('请选择支持的主题');
    const color = accentColor === undefined ? undefined : normalizeAccentColor(accentColor);
    return this.withWritableBoard(identity, boardId, async (tx, board) => {
      if (board.creatorId !== identity.userId)
        throw new ForbiddenException('只有榜单创建者可以更换主题');
      const resolved =
        background === undefined
          ? undefined
          : await this.backgrounds.resolve(
              background,
              identity.userId,
              (board.background as unknown as GroupRankBackground | null)
                ?.assetId,
              tx,
            );
      return this.mapBoard(
        await tx.groupRankBoard.update({
          where: { id: boardId },
          data: {
            themeId,
            ...(color !== undefined ? { accentColor: color } : {}),
            ...(resolved !== undefined
              ? {
                  background: resolved
                    ? (resolved as unknown as Prisma.InputJsonValue)
                    : Prisma.DbNull,
                }
              : {}),
          },
        }),
      );
    });
  }

  async setStatus(
    identity: GroupRankIdentity,
    boardId: string,
    status: string,
  ) {
    return this.withWritableBoard(identity, boardId, async (tx, board) => {
      if (board.creatorId !== identity.userId)
        throw new ForbiddenException('只有榜单创建者可以管理开放状态');
      if (board.status === 'closed' && status !== 'closed')
        throw new ConflictException('已关闭的榜单不能重新开放');
      return this.mapBoard(
        await tx.groupRankBoard.update({
          where: { id: boardId },
          data: { status },
        }),
      );
    });
  }
}
