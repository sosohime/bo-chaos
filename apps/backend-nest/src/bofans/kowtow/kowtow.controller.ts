import {
  Controller,
  Post,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { ok } from '@/common/api-response';
import { KowtowService } from './kowtow.service';
import { AuthGuard, OptionalAuthGuard } from '../auth/auth.guard';

class KowtowDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(999)
  count?: number;
}

@Controller('bofans/kowtows')
export class KowtowController {
  constructor(private kowtowService: KowtowService) {}

  @UseGuards(OptionalAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('stats')
  async stats(@Request() req: { user?: { openId: string } }) {
    return ok(await this.kowtowService.kowtowStats(req.user?.openId));
  }

  @UseGuards(AuthGuard)
  @Post()
  async kowtow(
    @Request() req: { user: { openId: string } },
    @Body() kowtowDto: KowtowDto,
  ) {
    return ok(
      await this.kowtowService.kowtow(req.user.openId, kowtowDto.count),
    );
  }
}
