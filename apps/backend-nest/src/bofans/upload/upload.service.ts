import {
  BadRequestException,
  Injectable,
  Logger,
  PayloadTooLargeException,
} from '@nestjs/common';
import * as FormData from 'form-data';
import * as sharp from 'sharp';
import axios from 'axios';
import { env } from '@/const/env';
import { photo as photoUtils } from '@mono/utils';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif']);

@Injectable()
export class UploadService {
  async uploadImage(params: {
    file: Express.Multer.File | undefined;
    user: string;
    category: 'photo' | 'avatar';
    ossPath: 'bofans/photo' | 'bofans/avatars';
  }): Promise<{
    filename: string;
    url: string;
    width: number;
    height: number;
  }> {
    const { file, user, category, ossPath } = params;
    if (!file) {
      throw new BadRequestException('未上传文件');
    }
    if (file.size > env.MAX_UPLOAD_BYTES) {
      throw new PayloadTooLargeException('图片过大');
    }
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException('不支持的图片类型');
    }

    const metadata = await sharp(file.buffer).metadata();
    if (!metadata.height || !metadata.width) {
      throw new BadRequestException('无法读取图片尺寸');
    }

    const filename = photoUtils.genStandardPictureName({
      category,
      user,
      ext: this.getFileExtension(file.originalname, file.mimetype),
      height: metadata.height,
      width: metadata.width,
    });

    const formData = new FormData();
    formData.append('file', file.buffer, filename);
    formData.append('path', ossPath);
    formData.append('should_unzip', 'false');
    formData.append('token', env.OSS_RS_UPLOAD_TOKEN);

    const uploadRes = await axios.post(
      `${env.PHOTO_OSS_HOST}/oss_service/upload`,
      formData,
      {
        headers: formData.getHeaders(),
        timeout: 15000,
        validateStatus: (status) => status >= 200 && status < 500,
      },
    );

    if (uploadRes.status !== 200) {
      Logger.error(`OSS upload failed with status ${uploadRes.status}`);
      throw new BadRequestException('图片上传失败');
    }

    const publicFolder = category === 'avatar' ? 'avatars' : 'photo';
    return {
      filename,
      url: `${env.PHOTO_OSS_HOST}/bofans_static/${publicFolder}/${filename}`,
      width: metadata.width,
      height: metadata.height,
    };
  }

  private getFileExtension(originalname: string | undefined, mimetype: string) {
    const dotIndex = originalname?.lastIndexOf('.') ?? -1;
    if (originalname && dotIndex >= 0) {
      return originalname.substring(dotIndex);
    }
    if (mimetype === 'image/png') return '.png';
    if (mimetype === 'image/gif') return '.gif';
    return '.jpg';
  }
}
