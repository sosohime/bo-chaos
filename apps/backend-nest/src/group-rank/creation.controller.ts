import { BackgroundBody } from './background-contract';
import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  Req,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import {
  IsDefined,
  IsIn,
  Matches,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { GroupRankDefinition } from '@mono/types';
import { ok } from '@/common/api-response';
import { GroupRankGuard, type GroupRankIdentity } from './group-auth.service';
import { GroupRankDraftService } from './drafts.service';
import { GroupRankProfileService } from './profile.service';

type ScopedRequest = { groupRankIdentity: GroupRankIdentity };
class DefinitionBody {
  @IsOptional() @IsIn(['single', 'multiple']) entryMode?: GroupRankDefinition['entryMode'];
  @IsOptional() @Matches(/^#[0-9a-fA-F]{6}$/) accentColor?: string | null;
  @IsOptional()
  @IsIn(['volt', 'midnight', 'coral'])
  themeId?: GroupRankDefinition['themeId'];
  @IsOptional()
  @ValidateNested()
  @Type(() => BackgroundBody)
  background?: BackgroundBody | null;
  @IsString() @Length(1, 24) name!: string;
  @IsString() @Length(0, 12) unit!: string;
  @IsIn(['latest', 'max', 'sum']) aggregate!: 'latest' | 'max' | 'sum';
  @IsIn(['asc', 'desc']) direction!: 'asc' | 'desc';
  @IsIn(['all_time', 'month']) period!: 'all_time' | 'month';
}
class DraftBody {
  @IsString() @Length(1, 256) code!: string;
  @IsString() @Length(1, 64) requestId!: string;
  @IsDefined()
  @ValidateNested()
  @Type(() => DefinitionBody)
  definition!: DefinitionBody;
}
class ProfileBody {
  @IsString() @Length(0, 24) nickname!: string;
}

@Controller('group-rank/drafts')
export class GroupRankDraftController {
  constructor(private readonly drafts: GroupRankDraftService) {}
  @Post()
  async create(@Body() body: DraftBody) {
    return ok(
      await this.drafts.create(body.code, body.definition, body.requestId),
    );
  }
  @Get(':id')
  @UseGuards(GroupRankGuard)
  async get(@Param('id') id: string) {
    return ok(await this.drafts.get(id));
  }
}

@Controller('group-rank')
@UseGuards(GroupRankGuard)
export class GroupRankProfileController {
  constructor(private readonly profiles: GroupRankProfileService) {}
  @Get('profile')
  async get(@Req() req: ScopedRequest) {
    return ok(await this.profiles.get(req.groupRankIdentity));
  }
  @Patch('profile')
  async patch(@Req() req: ScopedRequest, @Body() body: ProfileBody) {
    return ok(await this.profiles.save(req.groupRankIdentity, body.nickname));
  }
  @Post('profile')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 2 * 1024 * 1024,
        files: 1,
        fields: 1,
        fieldSize: 256,
        parts: 3,
      },
    }),
  )
  async upload(
    @Req() req: ScopedRequest,
    @Body() body: ProfileBody,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return ok(
      await this.profiles.save(req.groupRankIdentity, body.nickname, file),
    );
  }
  @Delete('profile/avatar')
  async clear(@Req() req: ScopedRequest) {
    return ok(await this.profiles.clearAvatar(req.groupRankIdentity));
  }
  @Get('profiles/:userId/avatar')
  @Header('Cache-Control', 'private, no-store')
  async avatar(@Req() req: ScopedRequest, @Param('userId') userId: string) {
    const buffer = await this.profiles.avatar(req.groupRankIdentity, userId);
    return new StreamableFile(buffer, {
      type: 'image/jpeg',
      length: buffer.length,
    });
  }
}
