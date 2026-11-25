import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '@/library/prisma.service';
import { ok } from '@/common/api-response';
import { isGroupRankWechatConfigured } from './group-auth.service';

@Controller('group-rank')
export class GroupRankHealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  async health() {
    const wechat = isGroupRankWechatConfigured()
      ? 'configured'
      : 'missing_credentials';
    try {
      const rows = await this.prisma.$queryRaw<{ ready: boolean }[]>`
        SELECT to_regclass('"GroupRankUser"') IS NOT NULL
          AND to_regclass('"GroupRankSpace"') IS NOT NULL
          AND to_regclass('"GroupRankMember"') IS NOT NULL
          AND to_regclass('"GroupRankBoard"') IS NOT NULL
          AND to_regclass('"GroupRankEntry"') IS NOT NULL
          AND to_regclass('"GroupRankDraft"') IS NOT NULL
          AND to_regclass('"GroupRankReport"') IS NOT NULL
          AND to_regclass('"GroupRankProxyParticipant"') IS NOT NULL
          AND to_regclass('"GroupRankProxyEntry"') IS NOT NULL
          AND to_regclass('"GroupRankRecommendationItem"') IS NOT NULL
          AND to_regclass('"GroupRankRecommendation"') IS NOT NULL
          AND (SELECT COUNT(*) = 1 FROM pg_attribute WHERE attrelid = to_regclass('"GroupRankEntry"') AND attname = 'recordedById' AND NOT attisdropped)
          AND (SELECT COUNT(*) = 2 FROM pg_attribute WHERE attrelid = to_regclass('"GroupRankUser"') AND attname IN ('nickname', 'avatarKey') AND NOT attisdropped)
          AND (SELECT COUNT(*) = 6 FROM pg_attribute WHERE attrelid = to_regclass('"GroupRankBoard"') AND attname IN ('draftId', 'deletedAt', 'themeId', 'background', 'accentColor', 'updatedAt') AND NOT attisdropped)
          AND (SELECT COUNT(*) = 1 FROM pg_attribute WHERE attrelid = to_regclass('"GroupRankRecommendation"') AND attname = 'note' AND NOT attisdropped)
          AND to_regclass('"GroupRankBackground"') IS NOT NULL AS ready
      `;
      if (!rows[0]?.ready) throw new Error('missing schema');
    } catch {
      throw new ServiceUnavailableException({
        status: 'blocked',
        database: 'unavailable',
        wechat,
      });
    }
    return ok({
      status: wechat === 'configured' ? 'ready' : 'partial',
      database: 'ready',
      wechat,
    });
  }
}
