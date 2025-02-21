import {
  Controller,
  Post,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { KowtowService } from './kowtow.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('bofans/kowtow')
export class KowtowController {
  constructor(private kowtowService: KowtowService) {}

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('stats')
  signIn(@Request() req: { user?: { openId: string } }) {
    const openId = req.user?.openId;
    return this.kowtowService.kowtowStats(openId);
  }

  @UseGuards(AuthGuard)
  @Post('kowtowOnce')
  kowtowOnce(@Request() req: { user: { openId: string } }) {
    const { openId } = req.user;
    return this.kowtowService.kowtowOnce(openId);
  }
}
