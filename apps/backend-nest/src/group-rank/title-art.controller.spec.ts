import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { GroupRankTitleArtController } from './title-art.controller';
import { GroupRankTitleArtService } from './title-art.service';
import { GroupRankAuthService, GroupRankGuard } from './group-auth.service';

describe('private title artwork HTTP boundary', () => {
  let app: INestApplication;
  const titles = {
    get: jest
      .fn()
      .mockResolvedValue({
        name: '尿酸王',
        imageDataUri: null,
        version: 'enamel-v1',
        width: 0,
        height: 0,
      }),
  };
  const auth = {
    verify: jest
      .fn()
      .mockResolvedValue({ userId: 'member', spaceId: 'group-a' }),
  };
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [GroupRankTitleArtController],
      providers: [
        GroupRankGuard,
        { provide: GroupRankAuthService, useValue: auth },
        { provide: GroupRankTitleArtService, useValue: titles },
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });
  afterAll(() => app.close());
  it('requires verified membership and never takes a caller-provided title or scope', async () => {
    await request(app.getHttpServer())
      .get('/group-rank/boards/board/title-art')
      .expect(401);
    expect(titles.get).not.toHaveBeenCalled();
    const result = await request(app.getHttpServer())
      .get('/group-rank/boards/board/title-art?name=foreign&spaceId=group-b')
      .set('Authorization', 'Bearer verified')
      .expect(200);
    expect(result.headers['cache-control']).toBe('private, no-store');
    expect(titles.get).toHaveBeenCalledWith(
      { userId: 'member', spaceId: 'group-a' },
      'board',
    );
    expect(result.body.data.name).toBe('尿酸王');
  });
});
