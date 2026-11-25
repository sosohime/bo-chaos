import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';

@Injectable()
export class GroupRankContentService {
  private token: { value: string; until: number; appId: string } | null = null;
  private pending: Promise<string> | null = null;

  private async accessToken(): Promise<string> {
    const appId = process.env.GROUP_RANK_APP_ID;
    const secret = process.env.GROUP_RANK_APP_SECRET;
    if (!appId || !secret)
      throw new ServiceUnavailableException('内容审核服务尚未配置');
    if (this.token?.appId === appId && this.token.until > Date.now())
      return this.token.value;
    if (this.pending) return this.pending;
    this.pending = (async () => {
      try {
        const response = await fetch(
          'https://api.weixin.qq.com/cgi-bin/stable_token',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              grant_type: 'client_credential',
              appid: appId,
              secret,
              force_refresh: false,
            }),
            signal: AbortSignal.timeout(10000),
          },
        );
        const data = await response.json();
        if (
          !response.ok ||
          typeof data.access_token !== 'string' ||
          !data.access_token ||
          !Number.isFinite(data.expires_in) ||
          data.expires_in < 120
        )
          throw new Error();
        this.token = {
          value: data.access_token,
          appId,
          until: Date.now() + (data.expires_in - 60) * 1000,
        };
        return data.access_token;
      } catch {
        throw new ServiceUnavailableException(
          '内容审核暂不可用，填写内容已保留，请稍后重试',
        );
      }
    })();
    try {
      return await this.pending;
    } finally {
      this.pending = null;
    }
  }

  async text(
    content: string,
    openId: string,
    scene: 1 | 4,
  ): Promise<string | null> {
    const token = await this.accessToken();
    let data: any;
    try {
      const response = await fetch(
        `https://api.weixin.qq.com/wxa/msg_sec_check?access_token=${encodeURIComponent(token)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, openid: openId, scene, version: 2 }),
          signal: AbortSignal.timeout(10000),
        },
      );
      if (!response.ok) throw new Error();
      data = await response.json();
      if (
        data.errcode !== 87014 &&
        (data.errcode !== 0 ||
          !['pass', 'review', 'risky'].includes(data.result?.suggest))
      )
        throw new Error();
    } catch {
      throw new ServiceUnavailableException(
        '内容审核暂不可用，填写内容已保留，请稍后重试',
      );
    }
    if (data.errcode === 87014 || data.result.suggest !== 'pass')
      throw new BadRequestException('这段文字暂不能使用，请修改后再试');
    return typeof data.trace_id === 'string' ? data.trace_id : null;
  }

  async image(buffer: Buffer) {
    const token = await this.accessToken();
    let data: any;
    try {
      const form = new FormData();
      form.append(
        'media',
        new Blob([new Uint8Array(buffer)], { type: 'image/jpeg' }),
        'avatar.jpg',
      );
      const response = await fetch(
        `https://api.weixin.qq.com/wxa/img_sec_check?access_token=${encodeURIComponent(token)}`,
        { method: 'POST', body: form, signal: AbortSignal.timeout(10000) },
      );
      if (!response.ok) throw new Error();
      data = await response.json();
      if (data.errcode !== 0 && data.errcode !== 87014) throw new Error();
    } catch {
      throw new ServiceUnavailableException('图片审核暂不可用，请稍后重试');
    }
    if (data.errcode !== 0)
      throw new BadRequestException('这张图片暂时不能使用，请重新选择');
  }
}
