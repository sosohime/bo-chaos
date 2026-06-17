import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Res,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { createHash, timingSafeEqual } from 'crypto';
import { IsString, MaxLength } from 'class-validator';
import { env } from '@/const/env';
import { ok } from '@/common/api-response';
import { UploadService } from '../upload/upload.service';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';

class AdminLoginDto {
  @IsString()
  account!: string;

  @IsString()
  password!: string;
}

class UpdateNicknameDto {
  @IsString()
  @MaxLength(48)
  nickname!: string;
}

@Controller('bofans/admin/auth')
export class AdminAuthController {
  constructor(private jwtService: JwtService) {}

  @Post('login')
  async login(
    @Body() loginDto: AdminLoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    if (
      loginDto.account !== env.ADMIN_ACCOUNT ||
      !this.verifyPassword(loginDto.password)
    ) {
      throw new UnauthorizedException('用户名密码错误');
    }
    const token = await this.jwtService.signAsync({
      account: loginDto.account,
    });
    response.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: env.ADMIN_COOKIE_SECURE,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    return ok(true);
  }

  private verifyPassword(password: string) {
    const input = createHash('sha256').update(password).digest('hex');
    const expected = env.ADMIN_PASSWORD_SHA256;
    if (input.length !== expected.length) return false;
    return timingSafeEqual(Buffer.from(input), Buffer.from(expected));
  }
}

@Controller('bofans/users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private uploadService: UploadService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('me')
  async userInfo(@Request() req: { user: { openId: string } }) {
    return ok(await this.usersService.userProfile(req.user.openId));
  }

  @UseGuards(AuthGuard)
  @Patch('me')
  async updateNickname(
    @Request() req: { user: { openId: string } },
    @Body() updateDto: UpdateNicknameDto,
  ) {
    return ok(
      await this.usersService.updateProfile(req.user.openId, {
        nickname: updateDto.nickname,
      }),
    );
  }

  @UseGuards(AuthGuard)
  @Post('me/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: env.MAX_UPLOAD_BYTES },
    }),
  )
  async updateAvatar(
    @Request() req: { user: { openId: string } },
    @UploadedFile() file: Express.Multer.File,
  ) {
    const upload = await this.uploadService.uploadImage({
      file,
      user: req.user.openId,
      category: 'avatar',
      ossPath: 'bofans/avatars',
    });
    return ok(
      await this.usersService.updateProfile(req.user.openId, {
        avatarUrl: upload.url,
      }),
    );
  }
}
