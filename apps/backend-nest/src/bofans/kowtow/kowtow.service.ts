import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/library/prisma.service';

@Injectable()
export class KowtowService {
  constructor(private prisma: PrismaService) {}

  // 磕一下
  async kowtowOnce(openId: string): Promise<boolean> {
    await this.prisma.user.update({
      where: { openId },
      data: { kowtowCount: { increment: 1 }, lastKowtowTime: new Date() },
    });
    return true;
  }

  // 查询全部磕头次数，以及今天磕了的人数
  // 全部磕头次数：所有用户的kowtowCount加在一起
  // 今天磕了的人数：lastKowtowTime在今天的用户数
  // 以及获取我今天磕没磕
  async kowtowStats(openId?: string): Promise<{
    iKowtowedToday: boolean;
    totalCount: number;
    todayKowtowedUser: number;
  }> {
    // 并行查询三个数据
    const [iKowtowedToday, totalCount, todayKowtowedUser] = await Promise.all([
      openId
        ? this.prisma.user.count({
            where: {
              openId,
              lastKowtowTime: {
                // 大于等于今天0点
                gte: new Date(new Date().setHours(0, 0, 0, 0)),
              },
            },
          })
        : Promise.resolve(0),
      this.prisma.user.aggregate({
        _sum: { kowtowCount: true },
      }),
      this.prisma.user.count({
        where: {
          lastKowtowTime: {
            // 大于等于今天0点
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return {
      totalCount: totalCount._sum.kowtowCount || 0,
      todayKowtowedUser,
      iKowtowedToday: !!iKowtowedToday,
    };
  }
}
