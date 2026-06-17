import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/library/prisma.service';
import {
  Photo,
  PhotoCategory,
  PhotoStatus,
  PhotoVote,
  Prisma,
} from '@mono/prisma-client';
import type {
  PhotoDto,
  ReviewPhotoDecision,
  ReviewPhotoDto,
} from '@mono/types';
import { env } from '@/const/env';
import {
  CategoryService,
  mapCategory,
  toCategorySystem,
} from '../category/category.service';

type PhotoWithClientData = Photo & {
  category?: PhotoCategory;
  votes?: PhotoVote[];
  _count?: { votes: number };
};

@Injectable()
export class PhotoService {
  constructor(
    private prisma: PrismaService,
    private categoryService: CategoryService,
  ) {}

  async listForSystem(params: {
    openId?: string;
    system: string;
    skip: number;
    take: number;
  }): Promise<{ items: PhotoDto[]; total: number }> {
    const system = toCategorySystem(params.system);
    const where: Prisma.PhotoWhereInput =
      env.BOFANS_WEAPP_PUBLISH_STATUS === 'in_review' && params.openId
        ? {
            category: { system },
            authorOpenId: params.openId,
          }
        : {
            category: { system },
            status: PhotoStatus.PASSED,
          };
    const [items, total] = await Promise.all([
      this.prisma.photo.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { id: 'desc' },
        include: this.clientPhotoInclude(params.openId),
      }),
      this.prisma.photo.count({ where }),
    ]);
    return { items: items.map(mapPhotoDto), total };
  }

  async findPublicPhoto(
    openId: string | undefined,
    id: number,
  ): Promise<PhotoDto | null> {
    const photo = await this.prisma.photo.findFirst({
      where: {
        id,
        status: PhotoStatus.PASSED,
      },
      include: this.clientPhotoInclude(openId),
    });
    return photo ? mapPhotoDto(photo) : null;
  }

  async createUserPhoto(params: {
    openId: string;
    name: string;
    system: string;
    categoryId?: number;
    newCategory?: string;
    filename: string;
  }): Promise<PhotoDto> {
    const category = await this.resolveUploadCategory(params);
    const photo = await this.prisma.photo.create({
      data: {
        filename: params.filename,
        name: params.name,
        category: { connect: { id: category.id } },
        author: { connect: { openId: params.openId } },
        status: PhotoStatus.REVIEWING,
      },
      include: this.clientPhotoInclude(params.openId),
    });
    return mapPhotoDto(photo);
  }

  async listMine(params: {
    openId: string;
    status?: string;
    skip: number;
    take: number;
  }): Promise<{ items: PhotoDto[]; total: number }> {
    const where: Prisma.PhotoWhereInput = {
      authorOpenId: params.openId,
      status:
        params.status === 'pending'
          ? PhotoStatus.REVIEWING
          : params.status === 'approved'
            ? PhotoStatus.PASSED
            : { not: PhotoStatus.REJECTED },
    };
    const [items, total] = await Promise.all([
      this.prisma.photo.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { id: 'desc' },
        include: this.clientPhotoInclude(params.openId),
      }),
      this.prisma.photo.count({ where }),
    ]);
    return {
      items: items.map((item) => ({
        ...mapPhotoDto(item),
        published:
          env.BOFANS_WEAPP_PUBLISH_STATUS === 'in_review' ||
          item.status === PhotoStatus.PASSED,
      })),
      total,
    };
  }

  async listReviews(params: {
    skip: number;
    take: number;
  }): Promise<{ items: ReviewPhotoDto[]; total: number }> {
    const where: Prisma.PhotoWhereInput = { status: PhotoStatus.REVIEWING };
    const [items, total] = await Promise.all([
      this.prisma.photo.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: { id: 'desc' },
        include: { category: true },
      }),
      this.prisma.photo.count({ where }),
    ]);
    return {
      items: items.map((item) => mapPhotoDto(item) as ReviewPhotoDto),
      total,
    };
  }

  async reviewPhotos(decisions: ReviewPhotoDecision[]): Promise<PhotoDto[]> {
    if (decisions.length === 0) return [];
    const updates = decisions.map(async (decision) => {
      if (decision.status === 'passed' && !decision.categoryId) {
        throw new BadRequestException('通过审核必须指定分类');
      }
      const status =
        decision.status === 'passed'
          ? PhotoStatus.PASSED
          : PhotoStatus.REJECTED;
      const photo = await this.prisma.photo.update({
        where: { id: decision.id },
        data: {
          status,
          ...(decision.categoryId
            ? { category: { connect: { id: decision.categoryId } } }
            : {}),
        },
        include: { category: true, _count: { select: { votes: true } } },
      });
      return mapPhotoDto(photo);
    });
    return Promise.all(updates);
  }

  async votePhoto(openId: string, photoId: number) {
    const photo = await this.prisma.photo.findFirst({
      where: { id: photoId, status: PhotoStatus.PASSED },
    });
    if (!photo) throw new NotFoundException('照片不存在');
    await this.prisma.photoVote.upsert({
      where: {
        photoId_userOpenId: { photoId, userOpenId: openId },
      },
      create: {
        photo: { connect: { id: photoId } },
        user: { connect: { openId } },
      },
      update: {},
    });
    return this.voteSummary(photoId, true);
  }

  async cancelVote(openId: string, photoId: number) {
    await this.prisma.photoVote
      .delete({
        where: {
          photoId_userOpenId: { photoId, userOpenId: openId },
        },
      })
      .catch(() => null);
    return this.voteSummary(photoId, false);
  }

  private async resolveUploadCategory(params: {
    openId: string;
    system: string;
    categoryId?: number;
    newCategory?: string;
  }) {
    const system = toCategorySystem(params.system);
    if (params.categoryId) {
      const category = await this.prisma.photoCategory.findFirst({
        where: { id: params.categoryId, system },
      });
      if (!category) throw new BadRequestException('分类不存在');
      return category;
    }
    if (!params.newCategory) {
      throw new BadRequestException('未指定二级分类');
    }
    return this.categoryService.createOrFindUserCategory({
      system: params.system,
      name: params.newCategory,
      authorOpenId: params.openId,
    });
  }

  private clientPhotoInclude(openId?: string): Prisma.PhotoInclude {
    return {
      category: true,
      _count: { select: { votes: true } },
      ...(openId ? { votes: { where: { userOpenId: openId } } } : {}),
    };
  }

  private async voteSummary(photoId: number, hasVoted: boolean) {
    const votesCount = await this.prisma.photoVote.count({
      where: { photoId },
    });
    return { success: true, hasVoted, votesCount };
  }
}

export function mapPhotoDto(photo: PhotoWithClientData): PhotoDto {
  return {
    id: photo.id,
    filename: photo.filename,
    name: photo.name || '',
    description: photo.description || '',
    viewedTimes: photo.viewedTimes,
    categoryId: photo.categoryId,
    status: fromPhotoStatus(photo.status),
    authorOpenId: photo.authorOpenId,
    category: photo.category ? mapCategory(photo.category) : undefined,
    hasVoted: photo.votes ? photo.votes.length > 0 : undefined,
    votesCount: photo._count?.votes,
  };
}

export function fromPhotoStatus(status: PhotoStatus): PhotoDto['status'] {
  if (status === PhotoStatus.PASSED) return 'passed';
  if (status === PhotoStatus.REJECTED) return 'rejected';
  return 'reviewing';
}
