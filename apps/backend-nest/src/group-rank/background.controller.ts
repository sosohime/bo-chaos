import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Query,
  Req,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsString, Length } from 'class-validator';
import { memoryStorage } from 'multer';
import { ok } from '@/common/api-response';
import { GroupRankGuard, type GroupRankIdentity } from './group-auth.service';
import { GroupRankBackgroundService } from './background.service';
class UploadBody {
  @IsString() @Length(1, 256) code!: string;
  @IsString() @Length(1, 64) requestId!: string;
}
@Controller('group-rank')
export class GroupRankBackgroundController {
  constructor(private readonly backgrounds: GroupRankBackgroundService) {}
  @Post('backgrounds')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 4 * 1024 * 1024,
        files: 1,
        fields: 2,
        fieldSize: 512,
        parts: 4,
      },
    }),
  )
  async upload(
    @Body() body: UploadBody,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return ok(await this.backgrounds.upload(body.code, body.requestId, file));
  }
  @Get('boards/:id/background')
  @UseGuards(GroupRankGuard)
  @Header('Cache-Control', 'private, no-store')
  async board(
    @Req() req: { groupRankIdentity: GroupRankIdentity },
    @Param('id') id: string,
    @Query('v') version?: string,
    @Query('slot') slot?: string,
    @Query('crop') crop?: string,
  ) {
    return this.image(
      await this.backgrounds.board(req.groupRankIdentity, id, version, slot, crop),
    );
  }
  @Get('drafts/:id/background')
  @UseGuards(GroupRankGuard)
  @Header('Cache-Control', 'private, no-store')
  async draft(@Param('id') id: string) {
    return this.image(await this.backgrounds.draft(id));
  }
  private image(buffer: Buffer) {
    return new StreamableFile(buffer, {
      type: 'image/jpeg',
      length: buffer.length,
    });
  }
}
