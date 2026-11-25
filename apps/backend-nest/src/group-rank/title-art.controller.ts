import { Controller, Get, Header, Param, Req, UseGuards } from '@nestjs/common';
import { ok } from '@/common/api-response';
import { GroupRankGuard, type GroupRankIdentity } from './group-auth.service';
import { GroupRankTitleArtService } from './title-art.service';

@Controller('group-rank/boards')
@UseGuards(GroupRankGuard)
export class GroupRankTitleArtController {
  constructor(private readonly titles: GroupRankTitleArtService) {}
  @Get(':boardId/title-art')
  @Header('Cache-Control', 'private, no-store')
  async get(
    @Req() req: { groupRankIdentity: GroupRankIdentity },
    @Param('boardId') boardId: string,
  ) {
    return ok(await this.titles.get(req.groupRankIdentity, boardId));
  }
}
