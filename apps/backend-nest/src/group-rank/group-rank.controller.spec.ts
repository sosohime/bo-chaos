import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { GroupRankAuthService, GroupRankGuard } from './group-auth.service';
import {
  GroupRankController,
  GroupRankSessionController,
} from './group-rank.controller';
import { GroupRankService } from './group-rank.service';

describe('group ranking HTTP boundary', () => {
  let app: INestApplication;
  const service = {
    createBoard: jest.fn(),
    createRecommendationBoard: jest.fn().mockResolvedValue({ id: 'recommendation-board' }),
    recommend: jest.fn().mockResolvedValue({ recommended: true }),
    withdrawRecommendation: jest.fn().mockResolvedValue({ withdrawn: true }),
    detail: jest.fn(),
    setAppearance: jest.fn(),
  };
  const auth = { verify: jest.fn(), enter: jest.fn() };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [GroupRankController, GroupRankSessionController],
      providers: [
        GroupRankGuard,
        { provide: GroupRankService, useValue: service },
        { provide: GroupRankAuthService, useValue: auth },
      ],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });
  beforeEach(() => {
    jest.clearAllMocks();
    auth.verify.mockResolvedValue({
      userId: 'user-a',
      spaceId: 'space-from-token',
    });
    service.createBoard.mockResolvedValue({ id: 'board-a' });
    service.detail.mockResolvedValue({ id: 'board-a', myEntries: [] });
  });
  afterAll(async () => {
    await app.close();
  });

  it('requires a bearer token and does not accept an old product cookie', async () => {
    await request(app.getHttpServer())
      .get('/group-rank/boards/a')
      .set('Cookie', 'token=old-product-token')
      .expect(401);
    expect(service.detail).not.toHaveBeenCalled();
  });
  it('rejects caller-selected group IDs instead of overriding token scope', async () => {
    await request(app.getHttpServer())
      .post('/group-rank/boards')
      .set('Authorization', 'Bearer verified-token')
      .send({
        templateId: 'game-score',
        requestId: 'request-a',
        spaceId: 'victim-space',
      })
      .expect(400);
    expect(service.createBoard).not.toHaveBeenCalled();
  });
  it('uses the verified scope and accepts detail requests without a cursor', async () => {
    await request(app.getHttpServer())
      .post('/group-rank/boards')
      .set('Authorization', 'Bearer verified-token')
      .send({ templateId: 'game-score', requestId: 'request-a' })
      .expect(201);
    expect(service.createBoard).toHaveBeenCalledWith(
      { userId: 'user-a', spaceId: 'space-from-token' },
      'game-score',
      'request-a',
    );
    await request(app.getHttpServer())
      .get('/group-rank/boards/board-a')
      .set('Authorization', 'Bearer verified-token')
      .expect(200);
    expect(service.detail).toHaveBeenCalledWith(
      { userId: 'user-a', spaceId: 'space-from-token' },
      'board-a',
      undefined,
    );
  });
  it('validates recommendation boards and uses the verified scope for recommendations', async () => {
    const identity = { userId: 'user-a', spaceId: 'space-from-token' };
    const recommendation = { name: '鼠标推荐榜', description: '推荐用过的型号' };
    const boards = () => request(app.getHttpServer()).post('/group-rank/boards').set('Authorization', 'Bearer token');
    await boards().send({ recommendation: [recommendation], requestId: 'rec' }).expect(400);
    await boards().send({ recommendation, templateId: 'game-score', requestId: 'rec' }).expect(400);
    await boards().send({ recommendation, requestId: 'rec' }).expect(201);
    expect(service.createRecommendationBoard).toHaveBeenCalledWith(identity, recommendation, 'rec');

    const votes = '/group-rank/boards/recommendation-board/recommendations';
    await request(app.getHttpServer()).post(votes).send({ model: 'MX Master 3S' }).expect(401);
    await request(app.getHttpServer()).post(votes).set('Authorization', 'Bearer token')
      .send({ model: 'MX Master 3S', userId: 'another-user' }).expect(400);
    await request(app.getHttpServer()).post(votes).set('Authorization', 'Bearer token')
      .send({ model: 'MX Master 3S' }).expect(201);
    expect(service.recommend).toHaveBeenCalledWith(identity, 'recommendation-board', 'MX Master 3S');
    await request(app.getHttpServer()).delete(`${votes}/model-a`).set('Authorization', 'Bearer token').expect(200);
    expect(service.withdrawRecommendation).toHaveBeenCalledWith(identity, 'recommendation-board', 'model-a');
  });
  it('guards theme updates, rejects arbitrary uploads and uses the verified token scope', async () => {
    const url = '/group-rank/boards/board-a/appearance';
    await request(app.getHttpServer())
      .patch(url)
      .send({ themeId: 'coral' })
      .expect(401);
    await request(app.getHttpServer())
      .patch(url)
      .set('Authorization', 'Bearer token')
      .send({ themeId: 'url', image: 'https://untrusted.invalid' })
      .expect(400);
    for (const accentColor of ['red', '#fff', '#FFFFFFFF', 'url(x)', 5, '#12345g']) {
      await request(app.getHttpServer()).patch(url).set('Authorization', 'Bearer token')
        .send({ themeId: 'volt', accentColor }).expect(400);
    }
    expect(service.setAppearance).not.toHaveBeenCalled();
    await request(app.getHttpServer())
      .patch(url)
      .set('Authorization', 'Bearer token')
      .send({ themeId: 'coral' })
      .expect(200);
    expect(service.setAppearance).toHaveBeenCalledWith(
      { userId: 'user-a', spaceId: 'space-from-token' },
      'board-a',
      'coral',
      undefined,
      undefined,
    );
    await request(app.getHttpServer()).patch(url).set('Authorization', 'Bearer token')
      .send({ themeId: 'volt', accentColor: '#f65d9b' }).expect(200);
    expect(service.setAppearance).toHaveBeenLastCalledWith(
      { userId: 'user-a', spaceId: 'space-from-token' }, 'board-a', 'volt', undefined, '#f65d9b',
    );
  });
});
