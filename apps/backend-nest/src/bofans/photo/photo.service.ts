import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/library/prisma.service';
import { Photo, PhotoVote, Prisma } from '@mono/prisma-client';

@Injectable()
export class PhotoService {
  constructor(private prisma: PrismaService) {}

  async photo(params: {
    where: Prisma.PhotoWhereUniqueInput;
    include?: Prisma.PhotoInclude;
  }): Promise<Photo | null> {
    return this.prisma.photo.findUnique(params);
  }

  async photos(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.PhotoWhereUniqueInput;
    where?: Prisma.PhotoWhereInput;
    orderBy?: Prisma.PhotoOrderByWithRelationInput;
    include?: Prisma.PhotoInclude;
  }): Promise<Photo[]> {
    const { skip, take, cursor, where, orderBy, include } = params;
    return this.prisma.photo.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
      include,
    });
  }

  async createPhoto(data: Prisma.PhotoCreateInput): Promise<Photo> {
    return this.prisma.photo.create({
      data,
    });
  }

  async updatePhoto(params: {
    where: Prisma.PhotoWhereUniqueInput;
    data: Prisma.PhotoUpdateInput;
  }): Promise<Photo> {
    const { data, where } = params;
    return this.prisma.photo.update({
      data,
      where,
    });
  }

  async deletePhoto(where: Prisma.PhotoWhereUniqueInput): Promise<Photo> {
    return this.prisma.photo.delete({
      where,
    });
  }

  async votePhoto(data: Prisma.PhotoVoteCreateInput): Promise<boolean> {
    try {
      await this.prisma.photoVote.create({
        data,
      });
      return true;
    } catch {
      return false;
    }
  }

  async findVote(params: { photoId: number; userOpenId: string }) {
    const { photoId, userOpenId } = params;
    return this.prisma.photoVote.findUnique({
      where: {
        photoId_userOpenId: {
          photoId,
          userOpenId,
        },
      },
    });
  }

  async createVote(data: Prisma.PhotoVoteCreateInput) {
    return this.prisma.photoVote.create({
      data,
    });
  }

  async deleteVote(
    where: Prisma.PhotoVoteWhereUniqueInput,
  ): Promise<PhotoVote> {
    return this.prisma.photoVote.delete({ where });
  }
}
