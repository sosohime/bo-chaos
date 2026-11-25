import { GroupRankBackgroundService } from './background.service';
import { GroupRankBackgroundController } from './background.controller';
import { GroupRankProxyController } from './proxy.controller';
import { GroupRankProxyService } from './proxy.service';
import { Module } from '@nestjs/common';
import { PrismaService } from '@/library/prisma.service';
import { GroupRankAuthService, GroupRankGuard } from './group-auth.service';
import {
  GroupRankController,
  GroupRankSessionController,
} from './group-rank.controller';
import { GroupRankService } from './group-rank.service';
import { GroupRankHealthController } from './health.controller';
import { GroupRankDraftService } from './drafts.service';
import { GroupRankProfileService } from './profile.service';
import { GroupRankContentService } from './content.service';
import { GroupRankTitleArtService } from './title-art.service';
import { GroupRankTitleArtController } from './title-art.controller';
import {
  GroupRankDraftController,
  GroupRankProfileController,
} from './creation.controller';

@Module({
  controllers: [
    GroupRankBackgroundController,
    GroupRankTitleArtController,
    GroupRankController,
    GroupRankProxyController,
    GroupRankSessionController,
    GroupRankHealthController,
    GroupRankDraftController,
    GroupRankProfileController,
  ],
  providers: [
    GroupRankBackgroundService,
    GroupRankTitleArtService,
    PrismaService,
    GroupRankAuthService,
    GroupRankGuard,
    GroupRankService,
    GroupRankProxyService,
    GroupRankDraftService,
    GroupRankProfileService,
    GroupRankContentService,
  ],
})
export class GroupRankModule {}
