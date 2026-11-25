import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createDecipheriv } from 'node:crypto';
import { PrismaService } from '@/library/prisma.service';
import type { GroupRankSessionDto } from '@mono/types';

export interface GroupRankIdentity {
  userId: string;
  spaceId: string;
}
const SESSION_SECONDS = 15 * 60;
const PAYLOAD_MAX_AGE_SECONDS = 5 * 60;
const ISSUER = 'group-rank';
const groupSourceLogger = new Logger('GroupRankGroupSource');

function config() {
  const appId = process.env.GROUP_RANK_APP_ID;
  const appSecret = process.env.GROUP_RANK_APP_SECRET;
  const jwtSecret = process.env.GROUP_RANK_JWT_SECRET;
  if (!appId || !appSecret || !jwtSecret || jwtSecret.length < 32) {
    throw new ServiceUnavailableException('群排行登录服务尚未配置');
  }
  return { appId, appSecret, jwtSecret };
}

export function isGroupRankWechatConfigured() {
  try {
    config();
    return true;
  } catch {
    return false;
  }
}

export function verifyGroupPayload(
  encryptedData: string,
  iv: string,
  sessionKey: string,
  appId: string,
  now = Date.now(),
) {
  let stage = 'cipher_shape';
  try {
    const key = Buffer.from(sessionKey, 'base64');
    const vector = Buffer.from(iv, 'base64');
    const encrypted = Buffer.from(encryptedData, 'base64');
    if (
      key.length !== 16 ||
      vector.length !== 16 ||
      !encrypted.length ||
      encrypted.length % 16 !== 0
    )
      throw new Error();
    stage = 'decrypt';
    const decipher = createDecipheriv('aes-128-cbc', key, vector);
    const payload = JSON.parse(
      Buffer.concat([decipher.update(encrypted), decipher.final()]).toString(
        'utf8',
      ),
    );
    stage = 'group_id';
    if (
      typeof payload?.opengid !== 'string' ||
      !payload.opengid.length ||
      payload.opengid.length > 256
    )
      throw new Error();
    stage = 'chat_type';
    if (payload.chat_type !== undefined && payload.chat_type !== 3)
      throw new Error();
    stage = 'single_room';
    if (
      payload.open_single_roomid !== undefined &&
      payload.open_single_roomid !== ''
    )
      throw new Error();
    // Older group-entry payloads contain only opengid. Optional newer fields
    // still reject single chats; the key comes from this AppID's jscode2session.
    if (payload.watermark === undefined) return payload.opengid as string;
    stage = 'watermark';
    if (!payload.watermark || typeof payload.watermark !== 'object')
      throw new Error();
    stage = 'app_id_missing';
    if (typeof payload.watermark.appid !== 'string') throw new Error();
    stage = 'app_id';
    if (payload.watermark.appid !== appId) throw new Error();
    const timestamp = payload.watermark.timestamp;
    stage = 'timestamp';
    if (!Number.isSafeInteger(timestamp)) throw new Error();
    const age = now / 1000 - timestamp;
    stage = 'future';
    if (age < -30) throw new Error();
    stage = 'expired';
    if (age > PAYLOAD_MAX_AGE_SECONDS) throw new Error();
    return payload.opengid as string;
  } catch {
    // Fixed stages only: never log WeChat payloads, identifiers, keys or codes.
    groupSourceLogger.warn(`group_source_rejected stage=${stage}`);
    throw new UnauthorizedException(
      '无法核验微信群来源，请从群聊分享卡片重新打开',
    );
  }
}

@Injectable()
export class GroupRankAuthService {
  private readonly jwt = new JwtService();
  constructor(private readonly prisma: PrismaService) {}

  // Internal identity exchange; callers must never serialize the session key.
  async exchangeCode(code: string) {
    const { appId, appSecret } = config();
    const url = new URL('https://api.weixin.qq.com/sns/jscode2session');
    url.search = new URLSearchParams({
      appid: appId,
      secret: appSecret,
      js_code: code,
      grant_type: 'authorization_code',
    }).toString();
    let wx: { errcode?: number; openid?: string; session_key?: string };
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error();
      wx = await response.json();
    } catch {
      throw new ServiceUnavailableException('微信身份服务暂不可用，请稍后重试');
    }
    if (
      !wx ||
      wx.errcode ||
      typeof wx.openid !== 'string' ||
      !wx.openid ||
      typeof wx.session_key !== 'string' ||
      !wx.session_key
    )
      throw new UnauthorizedException('微信登录已失效，请重试');
    return { appId, openId: wx.openid, sessionKey: wx.session_key };
  }

  async enter(
    code: string,
    encryptedData: string,
    iv: string,
  ): Promise<GroupRankSessionDto> {
    const { jwtSecret } = config();
    const { appId, openId, sessionKey } = await this.exchangeCode(code);
    const openGid = verifyGroupPayload(encryptedData, iv, sessionKey, appId);
    const identity = await this.prisma.$transaction(async (tx) => {
      // Empty updates can become read/create races during simultaneous first entries.
      const user = await tx.groupRankUser.upsert({
        where: { appId_openId: { appId, openId: openId } },
        create: { appId, openId: openId },
        update: { openId: openId },
      });
      const space = await tx.groupRankSpace.upsert({
        where: { appId_openGid: { appId, openGid } },
        create: { appId, openGid },
        update: { openGid },
      });
      await tx.groupRankMember.upsert({
        where: { spaceId_userId: { spaceId: space.id, userId: user.id } },
        create: { spaceId: space.id, userId: user.id },
        update: { lastSeenAt: new Date() },
      });
      return { userId: user.id, spaceId: space.id };
    });
    return {
      accessToken: await this.jwt.signAsync(
        { sub: identity.userId, gid: identity.spaceId },
        {
          secret: jwtSecret,
          issuer: ISSUER,
          audience: appId,
          algorithm: 'HS256',
          expiresIn: SESSION_SECONDS,
        },
      ),
      expiresIn: SESSION_SECONDS,
      // Presentation only. Reads/writes still authorize by the signed space ID.
      displayOpenGid: openGid,
    };
  }

  async verify(token: string): Promise<GroupRankIdentity> {
    const { appId, jwtSecret } = config();
    let payload: { sub?: string; gid?: string };
    try {
      payload = await this.jwt.verifyAsync<{ sub?: string; gid?: string }>(
        token,
        {
          secret: jwtSecret,
          issuer: ISSUER,
          audience: appId,
          algorithms: ['HS256'],
        },
      );
      if (typeof payload.sub !== 'string' || typeof payload.gid !== 'string')
        throw new Error();
    } catch {
      throw new UnauthorizedException('群会话已失效，请从群聊卡片重新进入');
    }
    let member;
    try {
      member = await this.prisma.groupRankMember.findUnique({
        where: {
          spaceId_userId: { spaceId: payload.gid!, userId: payload.sub! },
        },
        include: {
          space: { select: { appId: true } },
          user: { select: { appId: true } },
        },
      });
    } catch {
      throw new ServiceUnavailableException('暂时无法确认群权限，请稍后重试');
    }
    if (member?.space.appId !== appId || member?.user.appId !== appId)
      throw new UnauthorizedException('本群访问权限已失效');
    return { userId: payload.sub!, spaceId: payload.gid! };
  }
}

@Injectable()
export class GroupRankGuard implements CanActivate {
  constructor(private readonly auth: GroupRankAuthService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const [scheme, token] = (request.headers.authorization || '').split(' ');
    if (scheme !== 'Bearer' || !token)
      throw new UnauthorizedException('请从群聊分享卡片进入');
    request.groupRankIdentity = await this.auth.verify(token);
    return true;
  }
}
