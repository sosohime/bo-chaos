import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@mono/prisma-client';
import { PrismaService } from '@/library/prisma.service';
import type { GroupRankIdentity } from './group-auth.service';
import type { GroupRankTemplate } from '@mono/types';
import { GroupRankContentService } from './content.service';
import { shortText } from './definitions';
import { validateScore } from './templates';
import { isRecommendation } from './recommendations';
import { assertSingleClaim, singleRecordScope } from './record-policy';
import { touchBoard } from './board-activity';

@Injectable()
export class GroupRankProxyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly content: GroupRankContentService,
  ) {}

  private async board(
    tx: Prisma.TransactionClient,
    identity: GroupRankIdentity,
    boardId: string,
    creatorOnly = true,
  ) {
    const board = await tx.groupRankBoard.findFirst({
      where: { id: boardId, spaceId: identity.spaceId, deletedAt: null },
    });
    if (!board) throw new NotFoundException('本群没有这张榜单');
    if (isRecommendation(board.templateSnapshot))
      throw new BadRequestException('这张榜单只接受本人推荐');
    if (creatorOnly && board.creatorId !== identity.userId)
      throw new ForbiddenException('只有榜单创建者可以编辑代填');
    return board;
  }
  private locked<T>(
    identity: GroupRankIdentity,
    boardId: string,
    operation: (tx: Prisma.TransactionClient) => Promise<T>,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw(
        Prisma.sql`SELECT "id" FROM "GroupRankBoard" WHERE "id" = ${boardId} AND "spaceId" = ${identity.spaceId} FOR UPDATE`,
      );
      return operation(tx);
    });
  }
  private async profile(tx: Prisma.TransactionClient, userId: string) {
    const user = await tx.groupRankUser.findUnique({ where: { id: userId } });
    if (!user?.nickname?.trim() || !user.avatarKey)
      throw new ForbiddenException('请先设置头像和昵称，再认领');
    return user;
  }
  private async participant(
    tx: Prisma.TransactionClient,
    boardId: string,
    id: string,
  ) {
    const person = await tx.groupRankProxyParticipant.findFirst({
      where: { id, boardId, claimedUserId: null },
    });
    if (!person)
      throw new ConflictException('该名字已认领或不存在，请刷新榜单');
    return person;
  }
  private entry(
    entry: {
      id: string;
      value: Prisma.Decimal | null;
      revision: number;
      createdAt: Date;
    },
    recordedById: string,
  ) {
    if (entry.value === null)
      throw new ConflictException('这次代填已删除，请重新填写');
    return {
      id: entry.id,
      value: entry.value.toString(),
      revision: entry.revision,
      createdAt: entry.createdAt.toISOString(),
      recordedById,
    };
  }
  async submit(
    identity: GroupRankIdentity,
    boardId: string,
    input: {
      name?: string;
      participantId?: string;
      value: string;
      requestId: string;
    },
  ) {
    if (!!input.name === !!input.participantId)
      throw new BadRequestException('请选择待认领名字，或填写一个新名字');
    // Check authority before invoking external moderation; check it again under the board lock.
    await this.board(this.prisma, identity, boardId);
    const user = await this.prisma.groupRankUser.findUnique({
      where: { id: identity.userId },
      select: { openId: true },
    });
    if (!user) throw new NotFoundException('用户身份已失效，请重新进入');
    const name =
      input.name === undefined
        ? undefined
        : shortText(input.name, '名字', 24, true);
    if (name) await this.content.text(name, user.openId, 1);
    return this.locked(identity, boardId, async (tx) => {
      const board = await this.board(tx, identity, boardId);
      if (board.status !== 'open')
        throw new ForbiddenException('榜单已暂停或关闭，暂不能代填');
      const value = validateScore(
        input.value,
        board.templateSnapshot as unknown as GroupRankTemplate,
      );
      const previous = await tx.groupRankProxyEntry.findUnique({
        where: { boardId_requestId: { boardId, requestId: input.requestId } },
        include: { participant: true },
      });
      if (previous) {
        if (
          previous.participant.claimedUserId ||
          previous.deletedAt ||
          !previous.value
        )
          throw new ConflictException('这次代填已认领或删除，请刷新');
        if (
          !previous.value.equals(value) ||
          (input.participantId
            ? previous.participantId !== input.participantId
            : previous.participant.requestId !== input.requestId ||
              previous.participant.displayName !== name)
        )
          throw new ConflictException('同一次请求不能更换名字或数值');
        return {
          ...this.entry(previous, board.creatorId),
          participantId: previous.participantId,
        };
      }
      let person;
      if (input.participantId)
        person = await this.participant(tx, boardId, input.participantId);
      else {
        if (
          (await tx.groupRankProxyParticipant.count({
            where: { boardId, claimedUserId: null },
          })) >= 100
        )
          throw new BadRequestException(
            '本榜按名字登记已达100人，请先完成认领',
          );
        person = await tx.groupRankProxyParticipant.create({
          data: { boardId, displayName: name!, requestId: input.requestId },
        });
      }
      const template = board.templateSnapshot as unknown as GroupRankTemplate;
      if (template.entryMode === 'single' && await tx.groupRankProxyEntry.findFirst({
        where: { participantId: person.id, deletedAt: null, ...singleRecordScope(template) },
      })) throw new ConflictException('此榜每人一笔，请修改该名字的已有成绩');
      if (
        (await tx.groupRankProxyEntry.count({
          where: { participantId: person.id },
        })) >= 500
      )
        throw new BadRequestException('该名字记录已达500条，请先完成认领');
      const entry = await tx.groupRankProxyEntry.create({
        data: {
          boardId,
          participantId: person.id,
          requestId: input.requestId,
          value,
        },
      });
      await touchBoard(tx, boardId);
      return {
        ...this.entry(entry, board.creatorId),
        participantId: person.id,
      };
    });
  }
  async entries(
    identity: GroupRankIdentity,
    boardId: string,
    participantId: string,
  ) {
    const board = await this.board(this.prisma, identity, boardId);
    await this.participant(this.prisma, boardId, participantId);
    const entries = await this.prisma.groupRankProxyEntry.findMany({
      where: {
        boardId,
        participantId,
        deletedAt: null,
        participant: { claimedUserId: null },
      },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: 100,
    });
    return entries.map((entry) => this.entry(entry, board.creatorId));
  }
  async edit(
    identity: GroupRankIdentity,
    boardId: string,
    entryId: string,
    value: string,
    revision: number,
  ) {
    return this.locked(identity, boardId, async (tx) => {
      const board = await this.board(tx, identity, boardId);
      if (board.status !== 'open')
        throw new ForbiddenException('榜单已暂停或关闭，暂不能修改');
      const score = validateScore(
        value,
        board.templateSnapshot as unknown as GroupRankTemplate,
      );
      const changed = await tx.groupRankProxyEntry.updateMany({
        where: {
          id: entryId,
          boardId,
          deletedAt: null,
          revision,
          participant: { claimedUserId: null },
        },
        data: { value: score, revision: { increment: 1 } },
      });
      if (changed.count !== 1)
        throw new ConflictException('记录已变化或已认领，请刷新后再修改');
      await touchBoard(tx, boardId);
      return { updated: true };
    });
  }
  async remove(identity: GroupRankIdentity, boardId: string, entryId: string) {
    return this.locked(identity, boardId, async (tx) => {
      await this.board(tx, identity, boardId);
      const { count } = await tx.groupRankProxyEntry.updateMany({
        where: {
          id: entryId,
          boardId,
          deletedAt: null,
          participant: { claimedUserId: null },
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
  private async assertClaimFits(
    tx: Prisma.TransactionClient,
    boardId: string,
    userId: string,
    template: GroupRankTemplate,
    proxyEntries: { createdAt: Date }[],
  ) {
    if (template.entryMode !== 'single' || !proxyEntries.length) return;
    const own = await tx.groupRankEntry.findMany({
      where: { boardId, userId, deletedAt: null },
      select: { createdAt: true },
    });
    assertSingleClaim(template, [...own, ...proxyEntries]);
  }

  async claim(
    identity: GroupRankIdentity,
    boardId: string,
    participantId: string,
  ) {
    return this.locked(identity, boardId, async (tx) => {
      const board = await this.board(tx, identity, boardId, false);
      const person = await tx.groupRankProxyParticipant.findFirst({
        where: { id: participantId, boardId },
        select: { id: true, claimedUserId: true },
      });
      if (!person) throw new NotFoundException('没有找到这个待认领名字');
      if (person.claimedUserId === identity.userId) return { claimed: true };
      if (person.claimedUserId)
        throw new ConflictException('这条代填已被认领，请刷新榜单');
      const member = await tx.groupRankMember.findUnique({
        where: {
          spaceId_userId: { spaceId: identity.spaceId, userId: identity.userId },
        },
      });
      if (!member) throw new ForbiddenException('请先进入本群');
      await this.profile(tx, identity.userId);
      const entries = await tx.groupRankProxyEntry.findMany({
        where: { participantId: person.id, boardId, deletedAt: null },
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      });
      const template = board.templateSnapshot as unknown as GroupRankTemplate;
      if (!entries.length) throw new ConflictException('这条代填已删除，请刷新榜单');
      await this.assertClaimFits(tx, boardId, identity.userId, template, entries);
      // One transaction transfers original values/times and recorder; retries cannot copy them twice.
      await tx.groupRankEntry.createMany({
        data: entries.map((entry) => ({
          id: entry.id,
          boardId,
          userId: identity.userId,
          requestId: `proxy:${entry.id}`,
          value: entry.value,
          createdAt: entry.createdAt,
          recordedById: board.creatorId,
        })),
      });
      await tx.groupRankProxyEntry.updateMany({
        where: { participantId: person.id, deletedAt: null },
        data: {
          value: null,
          deletedAt: new Date(),
          revision: { increment: 1 },
        },
      });
      await tx.groupRankProxyParticipant.update({
        where: { id: person.id },
        data: {
          claimedUserId: identity.userId,
          claimedAt: new Date(),
          claimantUserId: null,
        },
      });
      await touchBoard(tx, boardId);
      return { claimed: true };
    });
  }
}
