jest.mock('@mono/const', () => ({
  bofans: {
    CATEGORY_SYSTEM: {
      HISTORY: 'history',
      TRAVEL: 'travel',
      TEASE: 'tease',
    },
  },
}));

import { CategorySystem, PhotoStatus } from '@mono/prisma-client';
import { fromPhotoStatus, mapPhotoDto } from './photo.service';

describe('Photo contract helpers', () => {
  it('maps Prisma photo payloads to public DTOs', () => {
    const dto = mapPhotoDto({
      id: 8,
      filename: 'https://example.com/photo.jpg',
      name: 'Bo',
      description: '',
      viewedTimes: 3,
      categoryId: 2,
      status: PhotoStatus.PASSED,
      authorOpenId: 'openid-1',
      createdAt: new Date('2026-06-17T00:00:00.000Z'),
      updatedAt: new Date('2026-06-17T00:00:00.000Z'),
      category: {
        id: 2,
        system: CategorySystem.TEASE,
        systemName: '博逗',
        name: 'default',
        authorOpenId: null,
        createdAt: new Date('2026-06-17T00:00:00.000Z'),
        updatedAt: new Date('2026-06-17T00:00:00.000Z'),
      },
      votes: [
        {
          id: 1,
          photoId: 8,
          userOpenId: 'openid-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      _count: { votes: 7 },
    });

    expect(dto.status).toBe('passed');
    expect(dto.category?.system).toBe('tease');
    expect(dto.hasVoted).toBe(true);
    expect(dto.votesCount).toBe(7);
  });

  it('maps rejected status to the public status string', () => {
    expect(fromPhotoStatus(PhotoStatus.REJECTED)).toBe('rejected');
  });
});
