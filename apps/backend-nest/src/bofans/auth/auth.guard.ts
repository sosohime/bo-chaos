import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Optional,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token =
      this.extractTokenFromHeader(request) ||
      this.extractTokenFromCookie(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: jwtConstants.secret,
      });
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    return (request.cookies?.token || '') as string;
  }
}

interface JwtPayload {
  openId?: string;
  account?: string;
}

@Injectable()
export class OptionalAuthGuard implements CanActivate {
  constructor(@Optional() private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token =
      this.extractTokenFromHeader(request) ||
      this.extractTokenFromCookie(request);
    if (!token || !this.jwtService) return true;

    try {
      request['user'] = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: jwtConstants.secret,
      });
    } catch {
      return true;
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    return (request.cookies?.token || '') as string;
  }
}
