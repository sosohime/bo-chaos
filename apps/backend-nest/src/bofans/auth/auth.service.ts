import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { env } from '@/const/env';

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

  async signIn(code: string): Promise<any> {
    Logger.log(`handle sign in request, wx login code: ${code}`);
    const { APP_ID, APP_SECRET } = env;
    const wxLoginUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${APP_ID}&secret=${APP_SECRET}&js_code=${code}&grant_type=authorization_code`;
    const wxRes = (await (await fetch(wxLoginUrl)).json()) as WxLoginResult;
    if (wxRes.errcode) {
      Logger.error(wxRes);
      throw new UnauthorizedException(wxRes.errmsg);
    }
    Logger.log(`wx login result: ${JSON.stringify(wxRes)}`);
    let user = await this.usersService.user({ openId: wxRes.openid });
    if (!user) {
      Logger.log(`create user for openId: ${wxRes.openid}`);
      user = await this.usersService.createUser({
        openId: wxRes.openid,
        nickname: '博粉' + Date.now(),
      });
    }
    Logger.log(`user sign in success: ${JSON.stringify(user)}`);
    return {
      access_token: this.jwtService.sign({ openId: user.openId }),
      session_key: wxRes.session_key,
      user,
    };
  }
}
