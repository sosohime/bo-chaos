import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { GroupRankProfile } from '@mono/types';
import { PrismaService } from '@/library/prisma.service';
import type { GroupRankIdentity } from './group-auth.service';
import { GroupRankContentService } from './content.service';
import { shortText } from './definitions';
import sharp = require('sharp');
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { isAbsolute, join } from 'node:path';

type ProfileUser = {
  id: string;
  nickname: string | null;
  avatarKey: string | null;
};
export function mapProfile(user: ProfileUser): GroupRankProfile {
  return {
    userId: user.id,
    nickname: user.nickname,
    avatarVersion: user.avatarKey,
  };
}

@Injectable()
export class GroupRankProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly content: GroupRankContentService,
  ) {}

  private root() {
    const root = process.env.GROUP_RANK_AVATAR_ROOT;
    if (!root || !isAbsolute(root))
      throw new ServiceUnavailableException(
        '头像存储尚未配置，仍可使用默认头像',
      );
    return root;
  }

  async get(identity: GroupRankIdentity) {
    const user = await this.prisma.groupRankUser.findUnique({
      where: { id: identity.userId },
    });
    if (!user) throw new NotFoundException('用户身份已失效，请重新打开');
    return mapProfile(user);
  }

  async save(
    identity: GroupRankIdentity,
    input: string,
    file?: Express.Multer.File,
  ) {
    const nickname = shortText(input, '昵称', 24, false);
    const user = await this.prisma.groupRankUser.findUnique({
      where: { id: identity.userId },
    });
    if (!user) throw new NotFoundException('用户身份已失效，请重新打开');
    if (nickname) await this.content.text(nickname, user.openId, 1);
    let avatarKey: string | undefined;
    if (file) {
      const root = this.root();
      if (!file.buffer?.length || file.buffer.length > 2 * 1024 * 1024)
        throw new BadRequestException('头像图片不能超过 2MB');
      let encoded: Buffer;
      try {
        const metadata = await sharp(file.buffer, {
          limitInputPixels: 16777216,
        }).metadata();
        if (
          !metadata.format ||
          !['jpeg', 'png', 'webp'].includes(metadata.format) ||
          (metadata.pages || 1) > 1
        )
          throw new Error();
        encoded = await sharp(file.buffer, { limitInputPixels: 16777216 })
          .rotate()
          .resize(256, 256, { fit: 'cover' })
          .jpeg({ quality: 85 })
          .toBuffer();
      } catch {
        throw new BadRequestException('请使用普通 JPG、PNG 或 WebP 图片');
      }
      await this.content.image(encoded);
      avatarKey = `${randomUUID()}.jpg`;
      await mkdir(root, { recursive: true, mode: 0o700 });
      await writeFile(join(root, avatarKey), encoded, {
        flag: 'wx',
        mode: 0o600,
      });
    }
    let updated: ProfileUser;
    try {
      updated = await this.prisma.groupRankUser.update({
        where: { id: identity.userId },
        data: {
          nickname: nickname || null,
          ...(avatarKey ? { avatarKey } : {}),
        },
      });
    } catch (error) {
      if (avatarKey) await unlink(join(this.root(), avatarKey)).catch(() => {});
      throw error;
    }
    if (
      avatarKey &&
      user.avatarKey &&
      /^[a-f0-9-]{36}\.jpg$/.test(user.avatarKey)
    )
      await unlink(join(this.root(), user.avatarKey)).catch(() => {});
    return mapProfile(updated);
  }

  async clearAvatar(identity: GroupRankIdentity) {
    const user = await this.prisma.groupRankUser.findUnique({
      where: { id: identity.userId },
    });
    if (!user) throw new NotFoundException('用户身份已失效，请重新打开');
    if (user.avatarKey) {
      const result = await this.prisma.groupRankUser.updateMany({
        where: { id: identity.userId, avatarKey: user.avatarKey },
        data: { avatarKey: null },
      });
      if (result.count && /^[a-f0-9-]{36}\.jpg$/.test(user.avatarKey))
        await unlink(join(this.root(), user.avatarKey)).catch(() => {});
    }
    return this.get(identity);
  }

  async avatar(identity: GroupRankIdentity, userId: string) {
    const member = await this.prisma.groupRankMember.findUnique({
      where: { spaceId_userId: { spaceId: identity.spaceId, userId } },
      include: { user: true },
    });
    const key = member?.user.avatarKey;
    if (!key || !/^[a-f0-9-]{36}\.jpg$/.test(key))
      throw new NotFoundException('头像不存在');
    try {
      return await readFile(join(this.root(), key));
    } catch {
      throw new NotFoundException('头像暂不可用');
    }
  }
}
