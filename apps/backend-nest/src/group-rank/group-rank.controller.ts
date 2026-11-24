import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { BackgroundBody } from './background-contract';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  IsIn,
  Matches,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { ok } from '@/common/api-response';
import {
  GroupRankAuthService,
  GroupRankGuard,
  type GroupRankIdentity,
} from './group-auth.service';
import { GroupRankService } from './group-rank.service';
import { RECOMMENDATION_NOTE_MAX_LENGTH } from './recommendations';
import { GROUP_RANK_TEMPLATES } from './templates';

class SessionBody {
  @IsString() @Length(1, 256) code!: string;
  @IsString() @Length(16, 4096) encryptedData!: string;
  @IsString() @Length(16, 64) iv!: string;
}
class RecommendationDefinitionBody {
  @IsString() @Length(1, 24) name!: string;
  @IsOptional() @IsString() @Length(0, 120) description?: string;
}
class RecommendationBody {
  @IsString() @Length(1, 80) model!: string;
  @IsOptional() @IsString() @Length(0, RECOMMENDATION_NOTE_MAX_LENGTH) note?: string;
}
class CreateBoardBody {
  @IsOptional() @IsObject() @ValidateNested() @Type(() => RecommendationDefinitionBody)
  recommendation?: RecommendationDefinitionBody;
  @IsOptional() @IsString() @Length(1, 64) templateId?: string;
  @IsOptional() @IsString() @Length(1, 80) draftId?: string;
  @IsString() @Length(1, 64) requestId!: string;
}
class SubmitBody {
  @IsString() @Length(1, 16) value!: string;
  @IsString() @Length(1, 64) requestId!: string;
}
class EditBody {
  @IsString() @Length(1, 16) value!: string;
  @IsInt() @Min(1) @Max(2147483646) revision!: number;
}
class AppearanceBody {
  @IsIn(['volt', 'midnight', 'coral']) themeId!: string;
  @IsOptional() @Matches(/^#[0-9a-fA-F]{6}$/) accentColor?: string | null;
  @IsOptional()
  @ValidateNested()
  @Type(() => BackgroundBody)
  background?: BackgroundBody | null;
}
class StatusBody {
  @IsIn(['open', 'paused', 'closed']) status!: string;
}
class ReportBody {
  @IsIn(['inappropriate', 'privacy', 'other']) reason!: string;
}
class HistoryQuery {
  @IsOptional() @IsString() @Length(1, 64) cursor?: string;
}
type GroupRequest = { groupRankIdentity: GroupRankIdentity };

@Controller('group-rank')
export class GroupRankSessionController {
  constructor(private readonly auth: GroupRankAuthService) {}
  @Post('session')
  async enter(@Body() body: SessionBody) {
    return ok(await this.auth.enter(body.code, body.encryptedData, body.iv));
  }
  @Get('templates')
  templates() {
    return ok(GROUP_RANK_TEMPLATES);
  }
}

@Controller('group-rank')
@UseGuards(GroupRankGuard)
export class GroupRankController {
  constructor(private readonly service: GroupRankService) {}
  @Get('current-group')
  async current(@Req() req: GroupRequest) {
    return ok(await this.service.currentGroup(req.groupRankIdentity));
  }
  @Post('boards')
  async create(@Req() req: GroupRequest, @Body() body: CreateBoardBody) {
    if ([body.templateId, body.draftId, body.recommendation].filter(Boolean).length !== 1)
      throw new BadRequestException('请选择一种榜单玩法');
    if (body.recommendation)
      return ok(await this.service.createRecommendationBoard(req.groupRankIdentity, body.recommendation, body.requestId));
    if (body.draftId)
      return ok(
        await this.service.createFromDraft(
          req.groupRankIdentity,
          body.draftId,
          body.requestId,
        ),
      );
    return ok(
      await this.service.createBoard(
        req.groupRankIdentity,
        body.templateId!,
        body.requestId,
      ),
    );
  }
  @Post('boards/:boardId/reports')
  async report(
    @Req() req: GroupRequest,
    @Param('boardId') boardId: string,
    @Body() body: ReportBody,
  ) {
    return ok(
      await this.service.report(req.groupRankIdentity, boardId, body.reason),
    );
  }
  @Delete('boards/:boardId')
  async removeBoard(
    @Req() req: GroupRequest,
    @Param('boardId') boardId: string,
  ) {
    return ok(await this.service.removeBoard(req.groupRankIdentity, boardId));
  }
  @Get('boards/:boardId')
  async detail(
    @Req() req: GroupRequest,
    @Param('boardId') boardId: string,
    @Query() query: HistoryQuery,
  ) {
    return ok(
      await this.service.detail(req.groupRankIdentity, boardId, query.cursor),
    );
  }
  @Post('boards/:boardId/recommendations')
  async recommend(
    @Req() req: GroupRequest,
    @Param('boardId') boardId: string,
    @Body() body: RecommendationBody,
  ) {
    return ok(await this.service.recommend(req.groupRankIdentity, boardId, body.model, body.note));
  }
  @Delete('boards/:boardId/recommendations/:itemId')
  async withdrawRecommendation(
    @Req() req: GroupRequest,
    @Param('boardId') boardId: string,
    @Param('itemId') itemId: string,
  ) {
    return ok(await this.service.withdrawRecommendation(req.groupRankIdentity, boardId, itemId));
  }
  @Post('boards/:boardId/entries')
  async submit(
    @Req() req: GroupRequest,
    @Param('boardId') boardId: string,
    @Body() body: SubmitBody,
  ) {
    return ok(
      await this.service.submit(
        req.groupRankIdentity,
        boardId,
        body.value,
        body.requestId,
      ),
    );
  }
  @Patch('boards/:boardId/entries/:entryId')
  async edit(
    @Req() req: GroupRequest,
    @Param('boardId') boardId: string,
    @Param('entryId') entryId: string,
    @Body() body: EditBody,
  ) {
    return ok(
      await this.service.edit(
        req.groupRankIdentity,
        boardId,
        entryId,
        body.value,
        body.revision,
      ),
    );
  }
  @Delete('boards/:boardId/entries/:entryId')
  async remove(
    @Req() req: GroupRequest,
    @Param('boardId') boardId: string,
    @Param('entryId') entryId: string,
  ) {
    return ok(
      await this.service.remove(req.groupRankIdentity, boardId, entryId),
    );
  }
  @Patch('boards/:boardId/appearance')
  async appearance(
    @Req() req: GroupRequest,
    @Param('boardId') boardId: string,
    @Body() body: AppearanceBody,
  ) {
    return ok(
      await this.service.setAppearance(
        req.groupRankIdentity,
        boardId,
        body.themeId,
        body.background,
        body.accentColor,
      ),
    );
  }
  @Patch('boards/:boardId/status')
  async status(
    @Req() req: GroupRequest,
    @Param('boardId') boardId: string,
    @Body() body: StatusBody,
  ) {
    return ok(
      await this.service.setStatus(req.groupRankIdentity, boardId, body.status),
    );
  }
}
