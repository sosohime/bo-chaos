import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ok } from '@/common/api-response';
import { IsString } from 'class-validator';

class WechatLoginDto {
  @IsString()
  code!: string;
}

@Controller('bofans/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('wechat-login')
  async signIn(@Body() signInDto: WechatLoginDto) {
    return ok(await this.authService.signIn(signInDto.code));
  }
}
