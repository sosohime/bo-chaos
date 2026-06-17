import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/library/prisma.service';
import { User, Prisma } from '@mono/prisma-client';
import type { UserProfileDto } from '@mono/types';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async user(
    userWhereUniqueInput: Prisma.UserWhereUniqueInput,
  ): Promise<(User & { kowtowCount: number }) | null> {
    const result = await this.prisma.user.findUnique({
      where: userWhereUniqueInput,
    });

    if (!result) return null;

    const kowtowCount = await this.prisma.userDailyBehavior.aggregate({
      where: {
        openId: result.openId,
      },
      _sum: {
        kowtowCount: true,
      },
    });

    return {
      ...result,
      kowtowCount: kowtowCount._sum.kowtowCount || 0,
    };
  }

  async userProfile(openId: string): Promise<UserProfileDto | null> {
    const user = await this.user({ openId });
    if (!user) return null;
    return {
      id: user.id,
      openId: user.openId,
      nickname: user.nickname,
      avatarUrl: user.avatarUrl,
      joinTime: user.joinTime.toISOString(),
      photoReviewer: user.photoReviewer,
      kowtowCount: user.kowtowCount,
    };
  }

  async updateProfile(
    openId: string,
    data: Pick<Prisma.UserUpdateInput, 'nickname' | 'avatarUrl'>,
  ): Promise<UserProfileDto | null> {
    await this.updateUser({ where: { openId }, data });
    return this.userProfile(openId);
  }

  async users(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async updateUser(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }
}
