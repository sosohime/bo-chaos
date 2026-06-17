import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { env } from '@/const/env';
import type { WechatLoginResponse } from '@mono/types';

interface WxLoginResult {
  openid: string;
  session_key: string;
  unionid: string;
  errcode: number;
  errmsg: string;
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(code: string): Promise<WechatLoginResponse> {
    Logger.log('handle wechat sign in request');
    const { APP_ID, APP_SECRET } = env;
    const wxLoginUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${APP_ID}&secret=${APP_SECRET}&js_code=${code}&grant_type=authorization_code`;
    const wxRes = (await (await fetch(wxLoginUrl)).json()) as WxLoginResult;
    if (wxRes.errcode) {
      Logger.error(wxRes);
      throw new UnauthorizedException(wxRes.errmsg);
    }
    let user = await this.usersService.user({ openId: wxRes.openid });
    if (!user) {
      Logger.log(`create user for openId: ${wxRes.openid}`);
      // @ts-expect-error createUser should be defined
      user = await this.usersService.createUser({
        openId: wxRes.openid,
        nickname: '博粉' + Date.now(),
      });
    }
    return {
      accessToken: this.jwtService.sign({ openId: wxRes.openid }),
    };
  }
}
