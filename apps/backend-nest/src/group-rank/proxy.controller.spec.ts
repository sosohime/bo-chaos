import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { GroupRankAuthService, GroupRankGuard } from './group-auth.service';
import { GroupRankProxyController } from './proxy.controller';
import { GroupRankProxyService } from './proxy.service';

describe('proxy HTTP input and identity boundaries', () => {
  let app: INestApplication;
  const service = {
    submit: jest.fn(),
    entries: jest.fn(),
    edit: jest.fn(),
    remove: jest.fn(),
    claim: jest.fn(),
  };
  const auth = {
    verify: jest
      .fn()
      .mockResolvedValue({ userId: 'actor', spaceId: 'verified-group' }),
  };
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [GroupRankProxyController],
      providers: [
        GroupRankGuard,
        { provide: GroupRankAuthService, useValue: auth },
        { provide: GroupRankProxyService, useValue: service },
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
  afterAll(async () => app.close());
  beforeEach(() => jest.clearAllMocks());
  it('requires a verified group token for every new operation', async () => {
    for (const [method, path] of [
      ['post', 'proxy-entries'],
      ['patch', 'proxy-entries/score'],
      ['delete', 'proxy-entries/score'],
      ['get', 'proxy-participants/name/entries'],
      ['post', 'proxy-participants/name/claim'],
    ]) {
      await request(app.getHttpServer())
        [method](`/group-rank/boards/board/${path}`)
        .expect(401);
    }
    expect(service.claim).not.toHaveBeenCalled();
  });
  it('rejects supplied owners/scopes, and oversized names', async () => {
    const url = '/group-rank/boards/board/proxy-entries';
    for (const body of [
      { name: '小王', value: '1', requestId: 'r', userId: 'victim' },
      { name: '长'.repeat(25), value: '1', requestId: 'r' },
    ]) {
      await request(app.getHttpServer())
        .post(url)
        .set('Authorization', 'Bearer token')
        .send(body)
        .expect(400);
    }
    expect(service.submit).not.toHaveBeenCalled();
  });
  it('claims directly with the group token identity and exposes no approval route', async () => {
    service.claim.mockResolvedValue({ claimed: true });
    const url = '/group-rank/boards/board/proxy-participants/name';
    await request(app.getHttpServer())
      .post(`${url}/claim`)
      .set('Authorization', 'Bearer token')
      .expect(201, { data: { claimed: true } });
    expect(service.claim).toHaveBeenCalledWith(
      { userId: 'actor', spaceId: 'verified-group' },
      'board',
      'name',
    );
    await request(app.getHttpServer())
      .post(`${url}/claim-review`)
      .set('Authorization', 'Bearer token')
      .expect(404);
  });
});
