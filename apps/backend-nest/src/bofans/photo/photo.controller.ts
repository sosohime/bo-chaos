import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { bofans } from '@mono/const';
import { ok, page } from '@/common/api-response';
import { getPagination, PaginationDto } from '@/common/pagination';
import { env } from '@/const/env';
import { AuthGuard, OptionalAuthGuard } from '../auth/auth.guard';
import { UploadService } from '../upload/upload.service';
import { PhotoService } from './photo.service';

class PhotoListQuery extends PaginationDto {
  @IsIn(Object.values(bofans.CATEGORY_SYSTEM))
  system!: string;
}

class MyPhotosQuery extends PaginationDto {
  @IsOptional()
  @IsIn(['pending', 'approved'])
  status?: string;
}

class UploadPhotoDto {
  @IsString()
  @MaxLength(80)
  name!: string;

  @IsIn(Object.values(bofans.CATEGORY_SYSTEM))
  system!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId?: number;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  newCategory?: string;
}

class ReviewPhotoDecisionDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId?: number;

  @IsIn([bofans.PHOTO_STATUS.PASSED, bofans.PHOTO_STATUS.REJECTED])
  status!: 'passed' | 'rejected';
}

class ReviewPhotosDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReviewPhotoDecisionDto)
  photos!: ReviewPhotoDecisionDto[];
}

@Controller('bofans')
export class PhotoController {
  constructor(
    private photoService: PhotoService,
    private uploadService: UploadService,
  ) {}

  @Get('photos')
  @UseGuards(OptionalAuthGuard)
  async photoList(
    @Request() req: { user?: { openId?: string } },
    @Query() query: PhotoListQuery,
  ) {
    const { page: pageNumber, pageSize, skip } = getPagination(query);
    const result = await this.photoService.listForSystem({
      openId: req.user?.openId,
      system: query.system,
      skip,
      take: pageSize,
    });
    return page(result.items, {
      page: pageNumber,
      pageSize,
      total: result.total,
      hasMore: skip + result.items.length < result.total,
    });
  }

  @Get('photos/my')
  @UseGuards(AuthGuard)
  async myUploaded(
    @Request() req: { user: { openId: string } },
    @Query() query: MyPhotosQuery,
  ) {
    const { page: pageNumber, pageSize, skip } = getPagination(query);
    const result = await this.photoService.listMine({
      openId: req.user.openId,
      status: query.status,
      skip,
      take: pageSize,
    });
    return page(result.items, {
      page: pageNumber,
      pageSize,
      total: result.total,
      hasMore: skip + result.items.length < result.total,
    });
  }

  @Get('photos/:id')
  @UseGuards(OptionalAuthGuard)
  async photo(
    @Request() req: { user?: { openId?: string } },
    @Param('id') id: string,
  ) {
    return ok(await this.photoService.findPublicPhoto(req.user?.openId, +id));
  }

  @Post('photos')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: env.MAX_UPLOAD_BYTES },
    }),
  )
  async uploadPhoto(
    @Request() req: { user: { openId: string } },
    @UploadedFile() file: Express.Multer.File,
    @Body() photoDto: UploadPhotoDto,
  ) {
    const upload = await this.uploadService.uploadImage({
      file,
      user: req.user.openId,
      category: 'photo',
      ossPath: 'bofans/photo',
    });
    return ok(
      await this.photoService.createUserPhoto({
        openId: req.user.openId,
        name: photoDto.name,
        system: photoDto.system,
        categoryId: photoDto.categoryId,
        newCategory: photoDto.newCategory,
        filename: upload.url,
      }),
    );
  }

  @Post('photos/:id/vote')
  @UseGuards(AuthGuard)
  async vote(
    @Request() req: { user: { openId: string } },
    @Param('id') id: string,
  ) {
    return ok(await this.photoService.votePhoto(req.user.openId, +id));
  }

  @Delete('photos/:id/vote')
  @UseGuards(AuthGuard)
  async cancelVote(
    @Request() req: { user: { openId: string } },
    @Param('id') id: string,
  ) {
    return ok(await this.photoService.cancelVote(req.user.openId, +id));
  }

  @Get('admin/photos/reviews')
  @UseGuards(AuthGuard)
  async reviewList(@Query() query: PaginationDto) {
    const { page: pageNumber, pageSize, skip } = getPagination(query);
    const result = await this.photoService.listReviews({
      skip,
      take: pageSize,
    });
    return page(result.items, {
      page: pageNumber,
      pageSize,
      total: result.total,
      hasMore: skip + result.items.length < result.total,
    });
  }

  @Patch('admin/photos/reviews')
  @UseGuards(AuthGuard)
  async reviewPhotos(@Body() reviewDto: ReviewPhotosDto) {
    return ok(await this.photoService.reviewPhotos(reviewDto.photos));
  }
}
