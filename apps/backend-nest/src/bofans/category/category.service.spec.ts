jest.mock('@mono/const', () => ({
  bofans: {
    CATEGORY_SYSTEM: {
      HISTORY: 'history',
      TRAVEL: 'travel',
      TEASE: 'tease',
    },
  },
}));

import { CategorySystem } from '@mono/prisma-client';
import {
  fromCategorySystem,
  mapCategory,
  toCategorySystem,
} from './category.service';

describe('Category contract helpers', () => {
  it('maps public category system strings to Prisma enums', () => {
    expect(toCategorySystem('travel')).toBe(CategorySystem.TRAVEL);
    expect(toCategorySystem('tease')).toBe(CategorySystem.TEASE);
    expect(toCategorySystem('history')).toBe(CategorySystem.HISTORY);
  });

  it('maps Prisma categories to public DTOs', () => {
    const dto = mapCategory({
      id: 1,
      system: CategorySystem.HISTORY,
      systemName: '博史',
      name: '群晖导入',
      authorOpenId: null,
      createdAt: new Date('2026-06-17T00:00:00.000Z'),
      updatedAt: new Date('2026-06-17T01:00:00.000Z'),
    });

    expect(dto).toEqual({
      id: 1,
      system: 'history',
      systemName: '博史',
      name: '群晖导入',
      updatedAt: '2026-06-17T01:00:00.000Z',
    });
    expect(fromCategorySystem(CategorySystem.HISTORY)).toBe('history');
  });
});
