import { Controller, Get, HttpCode } from '@nestjs/common';
import { BofansSystemConfigType } from '@mono/types';

@Controller('bofans/global')
export class GlobalController {
  constructor() {}

  @HttpCode(200)
  @Get('systemConfig')
  systemConfig(): BofansSystemConfigType {
    return {
      inReview: false,
    };
  }
}
