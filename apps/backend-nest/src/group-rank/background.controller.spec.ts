import { Test } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { GroupRankBackgroundController } from './background.controller';
import { GroupRankBackgroundService } from './background.service';
import { GroupRankGuard } from './group-auth.service';

describe('background HTTP boundary', () => {
  let app: INestApplication;
  const service = {
    upload: jest.fn().mockResolvedValue({ assetId: 'approved' }),
    board: jest.fn().mockResolvedValue(Buffer.from('jpeg')),
    draft: jest.fn().mockResolvedValue(Buffer.from('jpeg')),
  };
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [GroupRankBackgroundController],
      providers: [{ provide: GroupRankBackgroundService, useValue: service }],
    })
      .overrideGuard(GroupRankGuard)
      .useValue({
        canActivate: (context: any) => {
          const req = context.switchToHttp().getRequest();
          if (req.headers.authorization !== 'Bearer test') return false;
          req.groupRankIdentity = { spaceId: 'verified', userId: 'member' };
          return true;
        },
      })
      .compile();
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
  afterAll(() => app.close());
  it('allows fresh WeChat author proof without a group session, forwards only declared multipart fields', async () => {
    await request(app.getHttpServer())
      .post('/group-rank/backgrounds')
      .field('code', 'fresh')
      .field('requestId', 'same')
      .attach('file', Buffer.from('image'), { filename: 'a.jpg' })
      .expect(201);
    expect(service.upload).toHaveBeenCalledWith(
      'fresh',
      'same',
      expect.objectContaining({ buffer: Buffer.from('image') }),
    );
    await request(app.getHttpServer())
      .post('/group-rank/backgrounds')
      .field('code', 'fresh')
      .field('requestId', 'same')
      .field('ownerId', 'attacker')
      .attach('file', Buffer.from('image'), { filename: 'a.jpg' })
      .expect(400);
  });
  it('rejects private reads without group proof; binds authenticated reads to verified scope and image version', async () => {
    await request(app.getHttpServer())
      .get('/group-rank/boards/board/background')
      .expect(403);
    await request(app.getHttpServer())
      .get('/group-rank/boards/board/background?v=asset&slot=card&crop=1-0.5%2C0.5%2C1')
      .set('Authorization', 'Bearer test')
      .expect('Cache-Control', 'private, no-store')
      .expect('Content-Type', /image\/jpeg/)
      .expect(200);
    expect(service.board).toHaveBeenCalledWith(
      { spaceId: 'verified', userId: 'member' },
      'board',
      'asset',
      'card',
      '1-0.5,0.5,1',
    );
  });
});
