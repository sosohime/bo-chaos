import { isDeepStrictEqual } from 'node:util';
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
  GroupRankRecommendationDefinition,
  GroupRankSpaceDto,
  GroupRankTemplate,
} from '@mono/types';
import type { GroupRankIdentity } from './group-auth.service';
import { getOfficialTemplate, periodStart, validateScore } from './templates';
import { singleRecordScope } from './record-policy';
import { rankScores } from './ranking';
import { groupSummaries } from './summary';
import { customTemplate, findDraft, normalizeAccentColor, shortText } from './definitions';
import { mapProfile } from './profile.service';
import type { GroupRankDefinition } from '@mono/types';
import { GroupRankContentService } from './content.service';
import { isRecommendation, readRecommendations, readRecommendationSummaries, RECOMMENDATION_LIMIT, RECOMMENDATION_NOTE_MAX_LENGTH, RECOMMENDATION_TEMPLATE_ID } from './recommendations';
import { touchBoard } from './board-activity';

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
    private readonly content: GroupRankContentService,
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
            orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
          }),
          tx.groupRankMember.count({
            where: { spaceId: identity.spaceId },
          }),
          tx.groupRankUser.findUnique({ where: { id: identity.userId } }),
        ]);
        const recommendations = boards.filter(board => isRecommendation(board.templateSnapshot));
        const [summaries, recommendationSummaries] = await Promise.all([
          groupSummaries(tx, identity.spaceId, boards),
          readRecommendationSummaries(tx, identity.spaceId, recommendations.map(board => board.id)),
        ]);
        return {
          id: identity.spaceId,
          myUserId: identity.userId,
          memberCount,
          ...(profile ? { myProfile: mapProfile(profile) } : {}),
          boards: boards.map((board) => ({
            ...this.mapBoard(board),
            summary: summaries.get(board.id),
            recommendationSummary: recommendationSummaries.get(board.id),
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

  private async reviewText(identity: GroupRankIdentity, text: string) {
    const user = await this.prisma.groupRankUser.findUnique({
      where: { id: identity.userId },
      select: { openId: true },
    });
    if (!user) throw new NotFoundException('用户身份已失效，请重新进入');
    await this.content.text(text, user.openId, 4);
  }

  async createRecommendationBoard(
    identity: GroupRankIdentity,
    input: GroupRankRecommendationDefinition,
    requestId: string,
  ): Promise<GroupRankBoardDto> {
    const name = shortText(input.name, '榜单名称', 24);
    const description = shortText(input.description ?? '', '简介', 120, false);
    const template: GroupRankTemplate = {
      ...customTemplate(RECOMMENDATION_TEMPLATE_ID, {
        name, unit: '', aggregate: 'sum', direction: 'desc', period: 'all_time',
      }),
      id: RECOMMENDATION_TEMPLATE_ID,
      kind: 'recommendation',
      metric: '型号',
      description,
    };
    const requestKey = { spaceId: identity.spaceId, creatorId: identity.userId, requestId };
    const where = { spaceId_creatorId_requestId: requestKey };
    let board = await this.prisma.groupRankBoard.findUnique({ where });
    if (!board) {
      await this.reviewText(identity, description ? `${name} ${description}` : name);
      board = await this.prisma.groupRankBoard.upsert({
        where,
        create: {
          ...requestKey,
          templateId: template.id,
          templateVersion: template.version,
          templateSnapshot: template as unknown as Prisma.InputJsonValue,
        },
        update: { requestId },
      });
    }
    const result = this.mapBoard(board);
    if (board.deletedAt || result.template.kind !== 'recommendation' ||
        result.template.name !== name || result.template.description !== description)
      throw new ConflictException('这次请求已使用或榜单已移除，请重新创建');
    return result;
  }

  private requireRecommendationBoard(board: Board) {
    if (!isRecommendation(board.templateSnapshot))
      throw new BadRequestException('这张榜单不支持推荐');
  }

  private requireScoreBoard(board: Board) {
    if (isRecommendation(board.templateSnapshot))
      throw new BadRequestException('这张榜单只接受好物推荐');
  }

  async recommend(identity: GroupRankIdentity, boardId: string, input: string, inputNote?: string) {
    const model = shortText(input, '型号', 80).replace(/\s+/gu, ' ');
    const note = shortText(inputNote?.replace(/[\r\n]+/g, ' ') ?? '', '使用感受', RECOMMENDATION_NOTE_MAX_LENGTH, false);
    const modelKey = model.replace(/ /g, '').toLowerCase();
    const board = await this.board(identity, boardId);
    this.requireRecommendationBoard(board);
    if (board.status !== 'open') throw new ForbiddenException('榜单已暂停或关闭，暂不能推荐');
    const userId = identity.userId;
    const where = { boardId_modelKey: { boardId, modelKey } };
    const existing = await this.prisma.groupRankRecommendationItem.findUnique({
      where,
      select: { recommendations: { where: { userId }, select: { userId: true } } },
    });
    if (existing?.recommendations.length) return { recommended: true };
    const textToReview = existing ? note : [model, note].filter(Boolean).join(' ');
    if (textToReview) await this.reviewText(identity, textToReview);

    return this.withWritableBoard(identity, boardId, async (tx, lockedBoard) => {
      this.requireRecommendationBoard(lockedBoard);
      if (lockedBoard.status !== 'open') throw new ForbiddenException('榜单已暂停或关闭，暂不能推荐');
      const item = await tx.groupRankRecommendationItem.findUnique({ where, select: { id: true } });
      if (item && await tx.groupRankRecommendation.findUnique({
        where: { itemId_userId: { itemId: item.id, userId } },
      })) return { recommended: true };
      await this.requireParticipantProfile(tx, userId, '请先设置头像和昵称，再提交推荐');
      const used = await tx.groupRankRecommendation.count({ where: { userId, item: { boardId } } });
      if (used >= RECOMMENDATION_LIMIT)
        throw new ConflictException(`每人最多推荐 ${RECOMMENDATION_LIMIT} 个型号，请先撤回一个`);
      const { id: itemId } = item || await tx.groupRankRecommendationItem.create({
        data: { boardId, model, modelKey }, select: { id: true },
      });
      await tx.groupRankRecommendation.create({ data: { itemId, userId, note: note || null } });
      await touchBoard(tx, boardId);
      return { recommended: true };
    });
  }

  async withdrawRecommendation(identity: GroupRankIdentity, boardId: string, itemId: string) {
    return this.withWritableBoard(identity, boardId, async (tx, board) => {
      this.requireRecommendationBoard(board);
      const { count } = await tx.groupRankRecommendation.deleteMany({
        where: { itemId, userId: identity.userId, item: { boardId } },
      });
      if (count) await touchBoard(tx, boardId);
      return { withdrawn: true };
    });
  }

  async detail(
    identity: GroupRankIdentity,
    boardId: string,
    cursor?: string,
  ): Promise<GroupRankBoardDetail> {
    return this.prisma.$transaction(
      async (tx) => {
        const board = await this.board(identity, boardId, tx);
        if (isRecommendation(board.templateSnapshot)) {
          const [recommendations, profile] = await Promise.all([
            readRecommendations(tx, boardId),
            tx.groupRankUser.findUnique({ where: { id: identity.userId } }),
          ]);
          return {
            ...this.mapBoard(board), myUserId: identity.userId,
            ...(profile ? { myProfile: mapProfile(profile) } : {}),
            recommendations, ranking: [], myEntries: [],
            historyHasMore: false, historyNextCursor: null,
          };
        }
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
    message = '请先设置头像和昵称，再提交或修改成绩',
  ) {
    const user = await tx.groupRankUser.findUnique({
      where: { id: userId },
      select: { nickname: true, avatarKey: true },
    });
    if (!user?.nickname?.trim() || !user.avatarKey)
      throw new ForbiddenException(message);
  }

  async submit(
    identity: GroupRankIdentity,
    boardId: string,
    value: string,
    requestId: string,
  ): Promise<GroupRankEntryDto> {
    return this.withWritableBoard(identity, boardId, async (tx, board) => {
      this.requireScoreBoard(board);
      if (board.status !== 'open')
        throw new ForbiddenException('榜单已暂停或关闭，暂不能提交');
      await this.requireParticipantProfile(tx, identity.userId);
      const template = this.mapBoard(board).template;
      const score = validateScore(value, template);
      const previous = await tx.groupRankEntry.findUnique({
        where: { boardId_userId_requestId: { boardId, userId: identity.userId, requestId } },
      });
      if (!previous && template.entryMode === 'single' && await tx.groupRankEntry.findFirst({
        where: { boardId, userId: identity.userId, deletedAt: null, ...singleRecordScope(template) },
      })) throw new ConflictException('此榜每人一笔，请修改已有成绩');
      const entry = previous ?? await tx.groupRankEntry.create({
        data: { boardId, userId: identity.userId, requestId, value: score },
      });
      if (entry.deletedAt || !entry.value)
        throw new ConflictException('这次提交的成绩已删除，请重新填写');
      if (!entry.value.equals(score))
        throw new ConflictException('同一次提交请求不能更换成绩');
      if (!previous) await touchBoard(tx, boardId);
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
      this.requireScoreBoard(board);
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
      await touchBoard(tx, boardId);
      return { updated: true };
    });
  }

  async remove(identity: GroupRankIdentity, boardId: string, entryId: string) {
    return this.withWritableBoard(identity, boardId, async (tx, board) => {
      this.requireScoreBoard(board);
      const { count } = await tx.groupRankEntry.updateMany({
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
      if (count) await touchBoard(tx, boardId);
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
      if (isRecommendation(board.templateSnapshot)) {
        await tx.groupRankRecommendationItem.deleteMany({ where: { boardId } });
      } else {
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
      }
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
      const changed = themeId !== board.themeId ||
        (color !== undefined && color !== board.accentColor) ||
        (resolved !== undefined && !isDeepStrictEqual(resolved, board.background));
      if (!changed) return this.mapBoard(board);
      const updated = await tx.groupRankBoard.update({
        where: { id: boardId },
        data: {
          themeId,
          ...(color !== undefined ? { accentColor: color } : {}),
          ...(resolved !== undefined
            ? { background: resolved ? (resolved as unknown as Prisma.InputJsonValue) : Prisma.DbNull }
            : {}),
        },
      });
      await touchBoard(tx, boardId);
      return this.mapBoard(updated);
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
      if (board.status === status) return this.mapBoard(board);
      const updated = await tx.groupRankBoard.update({ where: { id: boardId }, data: { status } });
      await touchBoard(tx, boardId);
      return this.mapBoard(updated);
    });
  }
}
