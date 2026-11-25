import {
  BadRequestException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { GroupRankContentService } from './content.service';

function response(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status });
}
describe('server-side content moderation fails closed', () => {
  const original = process.env;
  let fetchSpy: jest.SpyInstance;
  let service: GroupRankContentService;
  beforeEach(() => {
    process.env = {
      ...original,
      GROUP_RANK_APP_ID: 'wx-test',
      GROUP_RANK_APP_SECRET: 'private-test-secret',
    };
    service = new GroupRankContentService();
    fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce(
        response({ access_token: 'private-access-token', expires_in: 7200 }),
      );
  });
  afterEach(() => {
    process.env = original;
    jest.restoreAllMocks();
  });
  it('deduplicates token requests and sends only the configured server identity', async () => {
    fetchSpy.mockImplementation(async () =>
      response({ errcode: 0, result: { suggest: 'pass' }, trace_id: 'trace' }),
    );
    expect(
      await Promise.all([
        service.text('普通排行', 'openid-a', 4),
        service.text('普通昵称', 'openid-a', 1),
      ]),
    ).toEqual(['trace', 'trace']);
    expect(
      fetchSpy.mock.calls.filter(([url]) =>
        String(url).endsWith('/stable_token'),
      ),
    ).toHaveLength(1);
    const body = JSON.parse(
      fetchSpy.mock.calls.find(([url]) =>
        String(url).includes('msg_sec_check'),
      )![1].body,
    );
    expect(body).toEqual(
      expect.objectContaining({ version: 2, openid: 'openid-a' }),
    );
  });
  it.each(['review', 'risky'])(
    'never publishes a text verdict %s',
    async (suggest) => {
      fetchSpy.mockResolvedValueOnce(
        response({ errcode: 0, result: { suggest } }),
      );
      await expect(service.text('内容', 'openid-a', 4)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    },
  );
  it.each([
    { errcode: 40001 },
    { errcode: 0 },
    { errcode: 0, result: { suggest: 'unknown' } },
  ])('blocks malformed or unavailable review responses %p', async (data) => {
    fetchSpy.mockResolvedValueOnce(response(data));
    await expect(service.text('内容', 'openid-a', 4)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
  it('blocks when credentials or remote service are unavailable', async () => {
    delete process.env.GROUP_RANK_APP_SECRET;
    await expect(service.text('内容', 'openid-a', 4)).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  it('accepts only an explicit successful image verdict', async () => {
    fetchSpy.mockResolvedValueOnce(response({ errcode: 87014 }));
    await expect(service.image(Buffer.from('jpeg'))).rejects.toBeInstanceOf(
      BadRequestException,
    );
    fetchSpy.mockResolvedValueOnce(response({ errcode: 40001 }));
    await expect(service.image(Buffer.from('jpeg'))).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
    fetchSpy.mockResolvedValueOnce(response({ errcode: 0 }));
    await expect(service.image(Buffer.from('jpeg'))).resolves.toBeUndefined();
  });
});
