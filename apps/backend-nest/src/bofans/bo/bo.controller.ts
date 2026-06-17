import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ok } from '@/common/api-response';
import { AuthGuard } from '../auth/auth.guard';
import { BoService } from './bo.service';

@UseGuards(AuthGuard)
@Controller('bofans/bo')
export class BoController {
  constructor(private boService: BoService) {}

  @Get('daily-card')
  async dailyCard(@Request() req: { user: { openId: string } }) {
    return ok(await this.boService.dailyCard(req.user.openId));
  }
}
