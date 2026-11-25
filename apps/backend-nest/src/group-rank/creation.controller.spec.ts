import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { GroupRankAuthService, GroupRankGuard } from './group-auth.service';
import {
  GroupRankDraftController,
  GroupRankProfileController,
} from './creation.controller';
import { GroupRankDraftService } from './drafts.service';
import { GroupRankProfileService } from './profile.service';

describe('draft and profile HTTP boundaries', () => {
  let app: INestApplication;
  const drafts = { create: jest.fn(), get: jest.fn() };
  const profiles = {
    get: jest.fn(),
    save: jest.fn(),
    avatar: jest.fn(),
    clearAvatar: jest.fn(),
  };
  const auth = { verify: jest.fn() };
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [GroupRankDraftController, GroupRankProfileController],
      providers: [
        GroupRankGuard,
        { provide: GroupRankAuthService, useValue: auth },
        { provide: GroupRankDraftService, useValue: drafts },
        { provide: GroupRankProfileService, useValue: profiles },
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
    auth.verify.mockResolvedValue({ userId: 'user-a', spaceId: 'group-a' });
    drafts.create.mockResolvedValue({ id: 'draft-a' });
    profiles.save.mockResolvedValue({
      userId: 'user-a',
      nickname: '小王',
      avatarVersion: null,
    });
    profiles.avatar.mockResolvedValue(Buffer.from('jpeg'));
  });
  afterAll(async () => app.close());
  it('allows explicit lobby rule saving with a code, but requires proof to read a draft or avatar', async () => {
    await request(app.getHttpServer())
      .post('/group-rank/drafts')
      .send({
        code: 'code',
        requestId: 'retry',
        definition: {
          name: '普通排行',
          unit: '',
          aggregate: 'latest',
          direction: 'desc',
          period: 'all_time',
        },
      })
      .expect(201);
    expect(drafts.create).toHaveBeenCalledTimes(1);
    await request(app.getHttpServer())
      .get('/group-rank/drafts/draft-a')
      .expect(401);
    await request(app.getHttpServer())
      .get('/group-rank/profiles/user-a/avatar')
      .expect(401);
    expect(drafts.get).not.toHaveBeenCalled();
    expect(profiles.avatar).not.toHaveBeenCalled();
  });
  it('rejects missing nested rules and caller-supplied scope fields', async () => {
    await request(app.getHttpServer())
      .post('/group-rank/drafts')
      .send({ code: 'code', requestId: 'retry' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/group-rank/drafts')
      .send({
        code: 'code',
        requestId: 'retry',
        definition: {
          name: '普通排行',
          unit: '',
          aggregate: 'latest',
          direction: 'desc',
          period: 'all_time',
          spaceId: 'foreign',
        },
      })
      .expect(400);
    await request(app.getHttpServer())
      .patch('/group-rank/profile')
      .set('Authorization', 'Bearer verified')
      .send({ nickname: '小王', userId: 'foreign' })
      .expect(400);
    expect(drafts.create).not.toHaveBeenCalled();
    expect(profiles.save).not.toHaveBeenCalled();
  });
  it('passes an uploaded avatar and current nickname only under the verified scope', async () => {
    await request(app.getHttpServer())
      .post('/group-rank/profile')
      .set('Authorization', 'Bearer verified')
      .field('nickname', '小王')
      .attach('file', Buffer.from('jpeg'), {
        filename: 'avatar.jpg',
        contentType: 'image/jpeg',
      })
      .expect(201);
    expect(profiles.save).toHaveBeenCalledWith(
      { userId: 'user-a', spaceId: 'group-a' },
      '小王',
      expect.objectContaining({ buffer: Buffer.from('jpeg') }),
    );
  });
  it('rejects oversized files before saving and serves authorized images without JSON wrapping', async () => {
    await request(app.getHttpServer())
      .post('/group-rank/profile')
      .set('Authorization', 'Bearer verified')
      .field('nickname', '')
      .attach('file', Buffer.alloc(2 * 1024 * 1024 + 1), {
        filename: 'large.jpg',
        contentType: 'image/jpeg',
      })
      .expect(413);
    expect(profiles.save).not.toHaveBeenCalled();
    const result = await request(app.getHttpServer())
      .get('/group-rank/profiles/user-a/avatar')
      .set('Authorization', 'Bearer verified')
      .expect(200);
    expect(result.headers['content-type']).toContain('image/jpeg');
    expect(result.headers['cache-control']).toBe('private, no-store');
    expect(result.body.equals(Buffer.from('jpeg'))).toBe(true);
  });
});
