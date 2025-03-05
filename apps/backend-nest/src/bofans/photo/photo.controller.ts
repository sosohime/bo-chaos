import {
  Controller,
  UseInterceptors,
  UploadedFile,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Param,
  Body,
  Logger,
  Post,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import * as FormData from 'form-data';
import axios from 'axios';
import { env } from '@/const/env';
import { UsersService } from '../users/users.service';
import { PhotoService } from './photo.service';
import { CategoryService } from '../category/category.service';
import { AuthGuard } from '../auth/auth.guard';
import { Photo, PhotoVote } from '@mono/prisma-client';
import { bofans } from '@mono/const';

@UseGuards(AuthGuard)
@Controller('bofans/photo')
export class PhotoController {
  constructor(
    private photoService: PhotoService,
    private categoryService: CategoryService,
    private usersService: UsersService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Get('list/:system')
  async photoList(
    @Request() req: { user: { openId: string } },
    @Param('system') system: string,
  ) {
    const openId = req.user.openId;
    const list = (await this.photoService.photos({
      where: {
        category: {
          system,
        },
        status: bofans.PHOTO_STATUS.PASSED,
      },
      include: {
        category: true,
        _count: {
          select: { votes: true },
        },
        votes: {
          where: {
            userOpenId: openId,
          },
        },
      },
    })) as (Photo & {
      votes: PhotoVote[];
      _count: {
        votes: number;
      };
    })[];

    const res = list.map((photo) => {
      const hasVoted = photo.votes?.length > 0;
      const votesCount = photo._count.votes;
      return {
        ...photo,
        hasVoted,
        votesCount,
      };
    });
    Logger.log(JSON.stringify(res[0]));
    return res;
  }

  @Get('get/:id')
  async photo(
    @Request() req: { user: { openId: string } },
    @Param('id') id: string,
  ) {
    const openId = req.user.openId;
    const photo = (await this.photoService.photo({
      where: {
        status: bofans.PHOTO_STATUS.PASSED,
        id: +id,
      },
      include: {
        category: true,
        _count: {
          select: { votes: true },
        },
        votes: {
          where: {
            userOpenId: openId,
          },
        },
      },
    })) as Photo & {
      votes: PhotoVote[];
      _count: {
        votes: number;
      };
    };
    Logger.log(`get photo by id ${id}, res: `, photo);

    if (photo) {
      const hasVoted = photo.votes?.length > 0;
      const votesCount = photo._count.votes;
      return {
        ...photo,
        hasVoted,
        votesCount,
      };
    }
    return null;
  }

  @Post('vote')
  async vote(
    @Request() req: { user: { openId: string } },
    @Body() voteDto: { photoId: number },
  ) {
    const { openId } = req.user;
    const { photoId } = voteDto;

    try {
      // 先检查是否已经投票
      const existingVote = await this.photoService.findVote({
        photoId,
        userOpenId: openId,
      });

      // 如果已经投票，直接返回
      if (existingVote) {
        return {
          success: true,
          message: '已经投过票了',
          data: existingVote,
        };
      }

      // 创建新的投票记录
      const result = await this.photoService.createVote({
        photo: {
          connect: { id: photoId },
        },
        user: {
          connect: { openId },
        },
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      Logger.error('Vote photo failed:', error);
      throw error;
    }
  }

  @Post('cancelVote')
  async cancelVote(
    @Request() req: { user: { openId: string } },
    @Body() voteDto: { photoId: number },
  ) {
    const { openId } = req.user;
    const { photoId } = voteDto;

    return await this.photoService.deleteVote({
      photoId_userOpenId: {
        userOpenId: openId,
        photoId,
      },
    });
  }

  @Post('upload_photo')
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async uploadPhoto(
    @Request() req: { user: { openId: string } },
    @UploadedFile() file: Express.Multer.File,
    @Body()
    photoDto: {
      name: string;
      system: string;
      categoryId?: string;
      newCategory?: string;
      filePath: string;
    },
  ) {
    const openId = req.user.openId;

    // 校验文件是否存在
    if (!file) {
      Logger.error('未接收到文件');
      return { success: false, message: '未上传文件' };
    }

    if (!photoDto.categoryId && !photoDto.newCategory) {
      Logger.error('未指定二级分类');
      return { success: false, message: '未指定二级分类' };
    }

    try {
      // 如果传入了categoryId，先查询对应categoryId是否存在，不存在则抛出错误
      let categoryId = Number(photoDto.categoryId);
      if (categoryId) {
        const existingCategory = await this.categoryService.findCategory({
          id: +categoryId,
          system: photoDto.system,
        });
        if (!existingCategory) {
          return { success: false, message: '分类不存在' };
        }
      }

      // 如果传入了newCategory，则先创建新的category，如果已创建则跳过
      if (photoDto.newCategory) {
        const existingCategory = await this.categoryService.findCategory({
          secondCategory: photoDto.newCategory,
          system: photoDto.system,
        });

        if (existingCategory) {
          categoryId = +existingCategory.id;
        } else {
          const newCategory = await this.categoryService.createCategory({
            secondCategory: photoDto.newCategory,
            system: photoDto.system,
            name: photoDto.name,
            author: { connect: { openId } },
          });
          categoryId = newCategory.id;
        }
      }

      // 上传图片到oss_service
      const formData = new FormData();
      const filename = `photo_${openId}_${Date.now()}${file.originalname.substring(
        file.originalname.lastIndexOf('.'),
      )}`;

      formData.append('file', file.buffer, filename);
      formData.append('path', 'bofans/photo');
      formData.append('should_unzip', 'false');
      formData.append('token', process.env.OSS_RS_UPLOAD_TOKEN);

      const uploadRes = await axios.post(
        `${env.PHOTO_OSS_HOST}/oss_service/upload`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        },
      );

      if (uploadRes.status !== 200) {
        Logger.error(uploadRes.data);
        throw new Error('图片上传失败');
      }

      // 插入Photo表
      const photo = await this.photoService.createPhoto({
        filename: `${env.PHOTO_OSS_HOST}/bofans_static/photo/${filename}`,
        category: { connect: { id: categoryId } },
        author: { connect: { openId } },
        status: bofans.PHOTO_STATUS.REVIEWING, // 默认未发布，需要审核
      });

      return {
        success: true,
        data: photo,
      };
    } catch (error) {
      Logger.error('Upload photo failed:', error);
      throw error;
    }
  }

  @Get('myUploaded')
  async myUploaded(@Request() req: { user: { openId: string } }) {
    const openId = req.user.openId;
    const photos = await this.photoService.photos({
      where: {
        authorOpenId: openId,
        status: {
          not: bofans.PHOTO_STATUS.REJECTED,
        },
      },
    });

    return photos.map((p) => ({
      ...p,
      published: p.status === bofans.PHOTO_STATUS.PASSED,
    }));
  }

  @Get('reviewList')
  async reviewList() {
    return this.photoService.photos({
      where: {
        status: bofans.PHOTO_STATUS.REVIEWING,
      },
    });
  }

  @Post('batchReviewPass')
  async batchReviewPass(
    @Body() photoDto: { photos: { id: number; categoryId: number }[] },
  ) {
    const { photos } = photoDto;

    // 使用Promise.all处理多个照片的更新
    const updatePromises = photos.map(async (photo) => {
      return this.photoService.updatePhoto({
        where: { id: photo.id },
        data: {
          status: bofans.PHOTO_STATUS.PASSED,
          category: {
            connect: { id: photo.categoryId },
          },
        },
      });
    });

    return Promise.all(updatePromises);
  }

  @Post('batchReviewReject')
  async batchReviewReject(@Body() photoDto: { ids: number[] }) {
    return this.photoService.updatePhotos({
      where: {
        id: {
          in: photoDto.ids,
        },
      },
      data: {
        status: bofans.PHOTO_STATUS.REJECTED,
      },
    });
  }
}
