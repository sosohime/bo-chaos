import { GroupRankBackgroundService } from './background.service';
import { ConflictException, Injectable } from '@nestjs/common';
import type { GroupRankDefinition } from '@mono/types';
import { Prisma } from '@mono/prisma-client';
import { PrismaService } from '@/library/prisma.service';
import { GroupRankAuthService } from './group-auth.service';
import { GroupRankContentService } from './content.service';
import {
  definitionKey,
  findDraft,
  mapDraft,
  normalizeDefinition,
} from './definitions';

@Injectable()
export class GroupRankDraftService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: GroupRankAuthService,
    private readonly content: GroupRankContentService,
    private readonly backgrounds: GroupRankBackgroundService,
  ) {}

  async create(
    code: string,
    definition: GroupRankDefinition,
    requestId: string,
  ) {
    const normalized = normalizeDefinition(definition);
    const { appId, openId } = await this.auth.exchangeCode(code);
    const creator = await this.prisma.groupRankUser.upsert({
      where: { appId_openId: { appId, openId } },
      create: { appId, openId },
      update: { openId },
    });
    const existing = await this.prisma.groupRankDraft.findUnique({
      where: { creatorId_requestId: { creatorId: creator.id, requestId } },
    });
    if (existing) {
      if (
        definitionKey(existing.definition as unknown as GroupRankDefinition) !==
        definitionKey(normalized)
      )
        throw new ConflictException('同一次保存不能更换规则，请重新保存');
      return mapDraft(existing);
    }
    if (normalized.background)
      normalized.background = await this.backgrounds.resolve(
        normalized.background,
        creator.id,
      );
    const reviewTrace = await this.content.text(
      `${normalized.name}\n单位：${normalized.unit || '无'}`,
      openId,
      4,
    );
    const draft = await this.prisma.groupRankDraft.upsert({
      where: { creatorId_requestId: { creatorId: creator.id, requestId } },
      create: {
        appId,
        creatorId: creator.id,
        requestId,
        definition: normalized as unknown as Prisma.InputJsonValue,
        reviewTrace,
        expiresAt: new Date(Date.now() + 7 * 86400000),
      },
      update: { requestId },
    });
    if (
      definitionKey(draft.definition as unknown as GroupRankDefinition) !==
      definitionKey(normalized)
    )
      throw new ConflictException('同一次保存不能更换规则，请重新保存');
    return mapDraft(draft);
  }

  async get(id: string) {
    return mapDraft(
      await findDraft(this.prisma, id, process.env.GROUP_RANK_APP_ID || ''),
    );
  }
}
