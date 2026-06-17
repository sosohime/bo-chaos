import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/library/prisma.service';
import { PhotoStatus } from '@mono/prisma-client';

const skillCards = [
  {
    key: 'photo',
    title: '摄影鉴定师',
    metric: 'uploadCount',
    copy: '今天适合挑一张旧图重新命名，Bo 的审美雷达已经醒了。',
  },
  {
    key: 'incense',
    title: '香火管理员',
    metric: 'kowtowCount',
    copy: '香火指数稳定上升，Bo 建议给今日好运加一点仪式感。',
  },
  {
    key: 'archive',
    title: '社区考古学家',
    metric: 'approvedCount',
    copy: '旧资料里有宝，Bo 今天想带你翻一翻已经通过的珍贵档案。',
  },
] as const;

@Injectable()
export class BoService {
  constructor(private prisma: PrismaService) {}

  async dailyCard(openId: string) {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const [user, kowtow, uploadCount, approvedCount, pendingCount] =
      await Promise.all([
        this.prisma.user.findUnique({
          where: { openId },
        }),
        this.prisma.userDailyBehavior.aggregate({
          where: { openId },
          _sum: { kowtowCount: true },
        }),
        this.prisma.photo.count({
          where: {
            authorOpenId: openId,
            status: { not: PhotoStatus.REJECTED },
          },
        }),
        this.prisma.photo.count({
          where: {
            authorOpenId: openId,
            status: PhotoStatus.PASSED,
          },
        }),
        this.prisma.photo.count({
          where: {
            authorOpenId: openId,
            status: PhotoStatus.REVIEWING,
          },
        }),
      ]);

    const kowtowCount = kowtow._sum.kowtowCount || 0;
    const joinDays = user?.joinTime
      ? Math.max(
          1,
          Math.ceil((now.getTime() - user.joinTime.getTime()) / 86400000),
        )
      : 1;

    const metrics = {
      kowtowCount,
      uploadCount,
      approvedCount,
      pendingCount,
    };
    const skill =
      skillCards
        .map((card) => ({ ...card, score: metrics[card.metric] }))
        .sort((a, b) => b.score - a.score)[0] || skillCards[0];
    const level = Math.max(1, Math.floor(skill.score / 5) + 1);
    const exp = skill.score % 5;

    return {
      date: today.toISOString().slice(0, 10),
      greeting: `${user?.nickname || 'Bo 友'}，今日 Bo 已上线`,
      mood: pendingCount > 0 ? '等审核等到转圈' : '状态清醒，适合整活',
      title: `今日职业：${skill.title} Lv.${level}`,
      insight: skill.copy,
      action:
        pendingCount > 0
          ? `还有 ${pendingCount} 张图在审核路上，先别急，Bo 在旁边蹲着。`
          : uploadCount > 0
            ? '今天可以再补一张资料，让 Bo 的素材库继续长肉。'
            : '今天适合上传第一张珍贵资料，给 Bo 一个开工理由。',
      skill: {
        key: skill.key,
        name: skill.title,
        level,
        exp,
        nextLevelExp: 5,
      },
      stats: {
        joinDays,
        kowtowCount,
        uploadCount,
        approvedCount,
        pendingCount,
      },
    };
  }
}
