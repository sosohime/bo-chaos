import { Controller, Get, HttpCode } from '@nestjs/common';
import { BofansSystemConfigType } from '@mono/types';
import { env } from '@/const/env';
import { ok } from '@/common/api-response';

@Controller('bofans/global')
export class GlobalController {
  constructor() {}

  @HttpCode(200)
  @Get('systemConfig')
  systemConfig() {
    return ok<BofansSystemConfigType>({
      inReview: env.BOFANS_WEAPP_PUBLISH_STATUS === 'in_review',
    });
  }
}
