import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import * as FormData from 'form-data';
import axios from 'axios';
import { env } from '@/const/env';
import { UsersService } from './users.service';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('bofans/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('userInfo')
  async userInfo(@Request() req: { user: { openId: string } }) {
    return await this.usersService.user({
      openId: req.user.openId,
    });
  }

  @Post('updateNickname')
  async updateNickname(
    @Request() req: { user: { openId: string } },
    @Body() updateDto: { nickname: string },
  ) {
    try {
      await this.usersService.updateUser({
        where: { openId: req.user.openId },
        data: { nickname: updateDto.nickname },
      });

      return true;
    } catch {
      return false;
    }
  }

  @Post('updateAvatar')
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() })) // 显式配置内存存储
  async updateAvatar(
    @Request() req: { user: { openId: string } },
    @UploadedFile() file: Express.Multer.File,
  ) {
    const openId = req.user.openId;

    // 校验文件是否存在
    if (!file) {
      Logger.error('未接收到文件');
      return { success: false, message: '未上传文件' };
    }

    try {
      const formData = new FormData();
      const getFileExtension = (filename: string) => {
        const lastDotIndex = filename.lastIndexOf('.');
        return lastDotIndex === -1 ? '' : filename.substring(lastDotIndex);
      };
      const originalExtension = file.originalname
        ? getFileExtension(file.originalname)
        : '.png';
      const filename = `avatar_${openId}_${Date.now()}${originalExtension}`;

      formData.append('file', file.buffer, filename);
      formData.append('path', 'bofans/avatars');
      formData.append('should_unzip', 'false');
      formData.append('token', env.OSS_RS_UPLOAD_TOKEN);

      const uploadRes = await axios.post(
        `${env.PHOTO_OSS_HOST}/oss_service/upload`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        },
      );

      Logger.log('调用oss_service res', uploadRes.data);
      if (uploadRes.status === 200) {
        const avatarUrl = `${env.PHOTO_OSS_HOST}/bofans_static/avatars/${filename}`;
        const user = await this.usersService.updateUser({
          where: { openId },
          data: { avatarUrl },
        });
        return user;
      }

      throw new Error('头像上传失败');
    } catch (error) {
      Logger.error(error);
      throw error;
    }
  }
}
