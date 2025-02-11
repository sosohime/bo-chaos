import {
  Controller,
  //   Post,
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
import { PhotoService } from './photo.service';
import { AuthGuard } from '../auth/auth.guard';
import { Photo, PhotoVote } from '@prisma/client';

@UseGuards(AuthGuard)
@Controller('bofans/photo')
export class PhotoController {
  constructor(private photoService: PhotoService) {}

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
        published: true,
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
        published: true,
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

  @Post('cancel_vote')
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

  //   @Post('kowtowOnce')
  //   kowtowOnce(@Request() req: { user: { openId: string } }) {
  //     const { openId } = req.user;
  //     return this.photoService.kowtowOnce(openId);
  //   }
}
