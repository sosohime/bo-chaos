import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { ok } from '@/common/api-response';
import { GroupRankGuard, type GroupRankIdentity } from './group-auth.service';
import { GroupRankProxyService } from './proxy.service';
class ProxySubmitBody {
  @IsOptional() @IsString() @Length(1, 24) name?: string;
  @IsOptional() @IsString() @Length(1, 80) participantId?: string;
  @IsString() @Length(1, 16) value!: string;
  @IsString() @Length(1, 64) requestId!: string;
}
class ProxyEditBody {
  @IsString() @Length(1, 16) value!: string;
  @IsInt() @Min(1) @Max(2147483646) revision!: number;
}
class ClaimReviewBody {
  @IsBoolean() approve!: boolean;
  @IsString() @Length(1, 80) claimantUserId!: string;
}
type Request = { groupRankIdentity: GroupRankIdentity };
@Controller('group-rank/boards/:boardId')
@UseGuards(GroupRankGuard)
export class GroupRankProxyController {
  constructor(private readonly service: GroupRankProxyService) {}
  @Post('proxy-entries')
  async submit(
    @Req() req: Request,
    @Param('boardId') boardId: string,
    @Body() body: ProxySubmitBody,
  ) {
    return ok(await this.service.submit(req.groupRankIdentity, boardId, body));
  }
  @Patch('proxy-entries/:entryId')
  async edit(
    @Req() req: Request,
    @Param('boardId') boardId: string,
    @Param('entryId') entryId: string,
    @Body() body: ProxyEditBody,
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
  @Delete('proxy-entries/:entryId')
  async remove(
    @Req() req: Request,
    @Param('boardId') boardId: string,
    @Param('entryId') entryId: string,
  ) {
    return ok(
      await this.service.remove(req.groupRankIdentity, boardId, entryId),
    );
  }
  @Get('proxy-participants/:participantId/entries')
  async entries(
    @Req() req: Request,
    @Param('boardId') boardId: string,
    @Param('participantId') participantId: string,
  ) {
    return ok(
      await this.service.entries(req.groupRankIdentity, boardId, participantId),
    );
  }
  @Post('proxy-participants/:participantId/claim')
  async claim(
    @Req() req: Request,
    @Param('boardId') boardId: string,
    @Param('participantId') participantId: string,
  ) {
    return ok(
      await this.service.claim(req.groupRankIdentity, boardId, participantId),
    );
  }
  @Post('proxy-participants/:participantId/claim-review')
  async review(
    @Req() req: Request,
    @Param('boardId') boardId: string,
    @Param('participantId') participantId: string,
    @Body() body: ClaimReviewBody,
  ) {
    return ok(
      await this.service.review(
        req.groupRankIdentity,
        boardId,
        participantId,
        body.approve,
        body.claimantUserId,
      ),
    );
  }
}
