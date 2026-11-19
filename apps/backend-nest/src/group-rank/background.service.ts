import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type {
  GroupRankBackground,
  GroupRankBackgroundChoice,
} from '@mono/types';
import type { Prisma } from '@mono/prisma-client';
import { PrismaService } from '@/library/prisma.service';
import {
  GroupRankAuthService,
  type GroupRankIdentity,
} from './group-auth.service';
import { GroupRankContentService } from './content.service';
import { normalizeBackground } from './background-contract';
import {
  backgroundRenditions,
  renderBackground,
  type BackgroundSlot,
} from './background-rendition';
import { findDraft } from './definitions';
import sharp = require('sharp');
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { isAbsolute, join } from 'node:path';

@Injectable()
export class GroupRankBackgroundService {
  private readonly renders = new Map<string, Promise<Buffer>>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly auth: GroupRankAuthService,
    private readonly content: GroupRankContentService,
  ) {}
  private root() {
    const root = process.env.GROUP_RANK_AVATAR_ROOT;
    if (!root || !isAbsolute(root))
      throw new ServiceUnavailableException('背景存储尚未配置');
    return join(root, 'backgrounds');
  }
  async upload(code: string, requestId: string, file?: Express.Multer.File) {
    const root = this.root();
    if (!file?.buffer?.length || file.buffer.length > 4 * 1024 * 1024)
      throw new BadRequestException('背景图片不能超过 4MB');
    const { appId, openId } = await this.auth.exchangeCode(code);
    const identity = { appId, openId };
    const owner = await this.prisma.groupRankUser.upsert({
      where: { appId_openId: identity },
      create: identity,
      update: {},
    });
    let encoded: { data: Buffer; info: sharp.OutputInfo };
    try {
      const metadata = await sharp(file.buffer, {
        limitInputPixels: 16777216,
      }).metadata();
      if (
        !['jpeg', 'png', 'webp'].includes(metadata.format || '') ||
        (metadata.pages || 1) > 1
      )
        throw new Error();
      encoded = await sharp(file.buffer, { limitInputPixels: 16777216 })
        .rotate()
        .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer({ resolveWithObject: true });
      if (encoded.data.length > 1024 * 1024) throw new Error();
    } catch {
      throw new BadRequestException('请使用普通 JPG、PNG 或 WebP 图片');
    }
    const digest = createHash('sha256').update(encoded.data).digest('hex');
    const where = { ownerId_requestId: { ownerId: owner.id, requestId } };
    const existing = await this.prisma.groupRankBackground.findUnique({
      where,
    });
    const map = (a: {
      id: string;
      digest: string;
      imageWidth: number;
      imageHeight: number;
    }) => {
      if (a.digest !== digest)
        throw new ConflictException('请重新选择背景图片');
      return {
        assetId: a.id,
        imageWidth: a.imageWidth,
        imageHeight: a.imageHeight,
      };
    };
    if (existing) return map(existing);
    const today = new Date(Date.now() + 8 * 3600000);
    today.setUTCHours(0, 0, 0, 0);
    today.setTime(today.getTime() - 8 * 3600000);
    if (
      (await this.prisma.groupRankBackground.count({
        where: { ownerId: owner.id, createdAt: { gte: today } },
      })) >= 20
    )
      throw new BadRequestException('今天上传的背景较多，请明天再试');
    await this.content.image(encoded.data);
    const id = randomUUID(),
      storageKey = `${id}.jpg`;
    await mkdir(root, { recursive: true, mode: 0o700 });
    await writeFile(join(root, storageKey), encoded.data, {
      flag: 'wx',
      mode: 0o600,
    });
    try {
      const stored = await this.prisma.$transaction(async (tx) => {
        // Serialize the quota and retry check across all workers, after image moderation.
        await tx.$queryRaw`SELECT "id" FROM "GroupRankUser" WHERE "id" = ${owner.id} FOR UPDATE`;
        const same = await tx.groupRankBackground.findUnique({ where });
        if (same) return same;
        if (
          (await tx.groupRankBackground.count({
            where: { ownerId: owner.id, createdAt: { gte: today } },
          })) >= 20
        )
          throw new BadRequestException('今天上传的背景较多，请明天再试');
        return tx.groupRankBackground.create({
          data: {
            id,
            appId: identity.appId,
            ownerId: owner.id,
            requestId,
            storageKey,
            digest,
            imageWidth: encoded.info.width,
            imageHeight: encoded.info.height,
          },
        });
      });
      if (stored.storageKey !== storageKey)
        await unlink(join(root, storageKey)).catch(() => {});
      return map(stored);
    } catch (error) {
      await unlink(join(root, storageKey)).catch(() => {});
      const raced = await this.prisma.groupRankBackground.findUnique({ where });
      if (raced) return map(raced);
      throw error;
    }
  }
  async resolve(
    input: GroupRankBackgroundChoice | null,
    userId: string,
    currentAssetId?: string,
    client: Prisma.TransactionClient = this.prisma,
  ): Promise<GroupRankBackground | null> {
    const choice = normalizeBackground(input);
    if (!choice) return null;
    const asset = await client.groupRankBackground.findFirst({
      where: { id: choice.assetId, appId: process.env.GROUP_RANK_APP_ID || '' },
    });
    if (!asset || (asset.ownerId !== userId && asset.id !== currentAssetId))
      throw new ForbiddenException('只能使用自己上传的背景');
    const background = {
      ...choice,
      imageWidth: asset.imageWidth,
      imageHeight: asset.imageHeight,
    };
    const versions = backgroundRenditions(background);
    let canonical: Promise<Buffer> | undefined;
    const source = () => (canonical ??= this.readFile(asset.storageKey));
    await Promise.all([
      this.rendition(background, 'cover', versions.cover, source),
      this.rendition(background, 'card', versions.card, source),
    ]);
    return background;
  }

  private rendition(
    background: GroupRankBackground,
    slot: BackgroundSlot,
    version: string,
    source: () => Promise<Buffer>,
  ) {
    const key = `${background.assetId}:${slot}:${version}`;
    const existing = this.renders.get(key);
    this.renders.delete(key);
    if (!existing && this.renders.size >= 64) {
      const oldest = this.renders.keys().next().value;
      if (oldest) this.renders.delete(oldest);
    }
    const rendering =
      existing ?? source().then((image) => renderBackground(image, background, slot));
    this.renders.set(key, rendering);
    if (!existing)
      void rendering.catch(() => {
        if (this.renders.get(key) === rendering) this.renders.delete(key);
      });
    return rendering;
  }
  private async read(background: unknown) {
    const id = (background as GroupRankBackground | null)?.assetId;
    if (!id) throw new NotFoundException('没有自定义背景');
    const asset = await this.prisma.groupRankBackground.findFirst({
      where: { id, appId: process.env.GROUP_RANK_APP_ID || '' },
    });
    if (!asset) throw new NotFoundException('背景不存在');
    return this.readFile(asset.storageKey);
  }
  private async readFile(storageKey: string) {
    if (!/^[a-f0-9-]{36}\.jpg$/.test(storageKey))
      throw new NotFoundException('背景不存在');
    try {
      return await readFile(join(this.root(), storageKey));
    } catch {
      throw new NotFoundException('背景暂不可用');
    }
  }
  async board(
    identity: GroupRankIdentity,
    id: string,
    expectedAssetId?: string,
    slot?: string,
    version?: string,
  ) {
    const board = await this.prisma.groupRankBoard.findFirst({
      where: { id, spaceId: identity.spaceId, deletedAt: null },
      select: { background: true },
    });
    if (!board) throw new NotFoundException('本群没有这张榜单');
    const background = board.background as unknown as GroupRankBackground | null;
    if (expectedAssetId && background?.assetId !== expectedAssetId)
      throw new ConflictException('榜单背景已更新，请刷新');
    if (slot !== undefined) {
      if (slot !== 'cover' && slot !== 'card')
        throw new BadRequestException('背景图片尺寸无效');
      if (!background) throw new NotFoundException('没有自定义背景');
      const current = backgroundRenditions(background)[slot];
      if (!expectedAssetId || version !== current)
        throw new ConflictException('榜单背景已更新，请刷新');
      return this.rendition(background, slot, current, () => this.read(background));
    }
    return this.read(board.background);
  }
  async draft(id: string) {
    const draft = await findDraft(
      this.prisma,
      id,
      process.env.GROUP_RANK_APP_ID || '',
    );
    return this.read(
      (draft.definition as { background?: unknown })?.background,
    );
  }
}
