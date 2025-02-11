import {
  Controller,
  //   Post,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Param,
  Logger,
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
  async signIn(
    @Request() req: { user?: { openId: string } },
    @Param('system') system: string,
  ) {
    const openId = req.user?.openId;
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

  //   @Post('kowtowOnce')
  //   kowtowOnce(@Request() req: { user: { openId: string } }) {
  //     const { openId } = req.user;
  //     return this.photoService.kowtowOnce(openId);
  //   }
}
