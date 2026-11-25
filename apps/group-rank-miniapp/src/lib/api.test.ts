import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { formatSubmittedAt } from "./format";

const wx = vi.hoisted(() => ({
  login: vi.fn(),
  getEnterOptionsSync: vi.fn(),
  getGroupEnterInfo: vi.fn(),
  request: vi.fn(),
  downloadFile: vi.fn(),
  uploadFile: vi.fn(),
  getFileInfo: vi.fn(),
}));
vi.mock("@tarojs/taro", () => ({ default: wx }));

let api: typeof import("./api");
beforeEach(async () => {
  vi.resetModules();
  vi.clearAllMocks();
  vi.stubGlobal("GROUP_RANK_API_BASE_URL", "https://example.test/group-rank");
  wx.getEnterOptionsSync.mockReturnValue({ scene: 1158 });
  wx.login.mockResolvedValue({ code: "transient-code" });
  wx.getGroupEnterInfo.mockResolvedValue({
    encryptedData: "encrypted-payload",
    iv: "initial-vector",
  });
  wx.request.mockImplementation(({ url }) =>
    Promise.resolve({
      statusCode: url.endsWith("/session") ? 201 : 200,
      data: {
        data: url.endsWith("/session")
          ? {
              accessToken: "group-A-token",
              expiresIn: 900,
              displayOpenGid: "verified-current-group",
            }
          : { id: "group-A" },
      },
    }),
  );
  api = await import("./api");
});
afterEach(() => {
  api.invalidateGroupSession();
  vi.unstubAllGlobals();
});

describe("automatic current-group client", () => {
  it("keeps only the verified session's display ID and clears it on failure or group change", async () => {
    const display = await import("./group-display");
    wx.request.mockImplementation(({ url }) =>
      Promise.resolve({
        statusCode: 200,
        data: {
          data: url.endsWith("/session")
            ? { accessToken: "A", expiresIn: 900, displayOpenGid: "verified-A" }
            : { id: "space-A" },
        },
      }),
    );
    await api.groupApi.currentGroup();
    expect(display.currentGroupDisplayId()).toBe("verified-A");
    wx.request.mockResolvedValueOnce({
      statusCode: 401,
      data: { message: "expired" },
    });
    await expect(api.groupApi.currentGroup()).rejects.toThrow("expired");
    expect(display.currentGroupDisplayId()).toBe("");
    await api.groupApi.currentGroup();
    api.invalidateGroupSession();
    expect(display.currentGroupDisplayId()).toBe("");
  });
  it("discards a late prior-group display ID after the active group changes", async () => {
    const display = await import("./group-display");
    await api.groupApi.currentGroup();
    expect(display.currentGroupDisplayId()).toBe("verified-current-group");
    api.invalidateGroupSession();
    let finish: (value: unknown) => void = () => {};
    wx.request.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const pending = api.groupApi.currentGroup();
    await vi.waitFor(() => expect(wx.request).toHaveBeenCalledTimes(3));
    api.invalidateGroupSession();
    finish({
      statusCode: 201,
      data: {
        data: { accessToken: "old-A", expiresIn: 900, displayOpenGid: "old-A" },
      },
    });
    await expect(pending).rejects.toThrow("群已变化");
    expect(display.currentGroupDisplayId()).toBe("");
  });
  it("rejects an incomplete service session instead of accepting a partial protocol", async () => {
    wx.request.mockResolvedValueOnce({
      statusCode: 201,
      data: { data: { accessToken: "incomplete", expiresIn: 900 } },
    });
    await expect(api.groupApi.currentGroup()).rejects.toThrow(
      "群会话信息不完整",
    );
    expect((await import("./group-display")).currentGroupDisplayId()).toBe("");
    expect(wx.request).toHaveBeenCalledTimes(1);
  });
  it("shares one verified login between concurrent page requests", async () => {
    await Promise.all([
      api.groupApi.currentGroup(),
      api.groupApi.currentGroup(),
    ]);
    expect(wx.login).toHaveBeenCalledTimes(1);
    expect(wx.getGroupEnterInfo).toHaveBeenCalledTimes(1);
    expect(
      wx.request.mock.calls.filter(([options]) =>
        options.url.endsWith("/session"),
      ),
    ).toHaveLength(1);
    const request = wx.request.mock.calls.find(([options]) =>
      options.url.endsWith("/current-group"),
    )![0];
    expect(request.header).toEqual({ Authorization: "Bearer group-A-token" });
    expect(request.data).toBeUndefined();
  });
  it("lets a normal entry browse official templates without a group or login", async () => {
    wx.getEnterOptionsSync.mockReturnValue({ scene: 1001 });
    await api.groupApi.templates();
    expect(wx.login).not.toHaveBeenCalled();
    expect(wx.getGroupEnterInfo).not.toHaveBeenCalled();
    expect(wx.request.mock.calls[0][0].header).toEqual({});
  });
  it("blocks lobby reads and writes even when a previous group token is still cached", async () => {
    await api.groupApi.currentGroup();
    wx.getEnterOptionsSync.mockReturnValue({
      scene: 1001,
      query: { board: "old" },
    });
    wx.request.mockClear();
    wx.login.mockClear();
    wx.getGroupEnterInfo.mockClear();
    await expect(api.groupApi.currentGroup()).rejects.toBeInstanceOf(
      api.GroupContextUnavailableError,
    );
    await expect(
      api.groupApi.submit("old", "1", "retry"),
    ).rejects.toBeInstanceOf(api.GroupContextUnavailableError);
    expect(wx.request).not.toHaveBeenCalled();
    expect(wx.login).not.toHaveBeenCalled();
    expect(wx.getGroupEnterInfo).not.toHaveBeenCalled();
  });
  it("does not fall back to a URL group ID when WeChat cannot identify a group", async () => {
    wx.getGroupEnterInfo.mockRejectedValueOnce({
      errMsg: "not a group launch",
    });
    await expect(api.groupApi.currentGroup()).rejects.toBeInstanceOf(
      api.GroupContextUnavailableError,
    );
    expect(wx.request).not.toHaveBeenCalled();
  });
  it("refuses incomplete group proof without sending a login code to the server", async () => {
    wx.getGroupEnterInfo.mockResolvedValueOnce({ errMsg: "ok" });
    await expect(api.groupApi.currentGroup()).rejects.toBeInstanceOf(
      api.GroupContextUnavailableError,
    );
    expect(wx.request).not.toHaveBeenCalled();
  });
  it("keeps a service failure distinct from the missing-group entry state", async () => {
    wx.request.mockResolvedValueOnce({
      statusCode: 503,
      data: { message: "服务不可用" },
    });
    const error = await api.groupApi.currentGroup().catch((reason) => reason);
    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(api.GroupContextUnavailableError);
    expect(error.message).toBe("服务不可用");
  });
  it("does not reuse group A credentials after a new app foreground context", async () => {
    await api.groupApi.currentGroup();
    api.invalidateGroupSession();
    wx.getGroupEnterInfo.mockRejectedValueOnce({ errMsg: "no group" });
    await expect(api.groupApi.currentGroup()).rejects.toThrow("请从微信群");
    expect(
      wx.request.mock.calls.filter(([options]) =>
        options.url.endsWith("/current-group"),
      ),
    ).toHaveLength(1);
  });
  it("discards group A data returned after the user enters another group", async () => {
    let finish: (result: unknown) => void = () => {};
    wx.request.mockImplementation(({ url }) =>
      url.endsWith("/session")
        ? Promise.resolve({
            statusCode: 201,
            data: {
              data: {
                accessToken: "A",
                expiresIn: 900,
                displayOpenGid: "verified-current-group",
              },
            },
          })
        : new Promise((resolve) => {
            finish = resolve;
          }),
    );
    const pending = api.groupApi.currentGroup();
    await vi.waitFor(() => expect(wx.request).toHaveBeenCalledTimes(2));
    api.invalidateGroupSession();
    finish({ statusCode: 200, data: { data: { id: "private-group-A" } } });
    await expect(pending).rejects.toThrow("群已变化");
  });
  it("surfaces a 401 without recursive login or retrying a write", async () => {
    await api.groupApi.currentGroup();
    wx.request.mockResolvedValueOnce({
      statusCode: 401,
      data: { message: "会话过期" },
    });
    await expect(
      api.groupApi.submit("board", "12", "request-one"),
    ).rejects.toThrow("会话过期");
    expect(wx.login).toHaveBeenCalledTimes(1);
    expect(
      wx.request.mock.calls.filter(
        ([options]) =>
          options.method === "POST" && options.url.endsWith("/entries"),
      ),
    ).toHaveLength(1);
  });
  it("blocks requests until a service endpoint has been configured", async () => {
    vi.stubGlobal("GROUP_RANK_API_BASE_URL", "");
    await expect(api.groupApi.currentGroup()).rejects.toThrow("服务暂未开放");
    expect(wx.login).not.toHaveBeenCalled();
  });

  it("does not clear a newer group session when an old request returns 401", async () => {
    await api.groupApi.currentGroup();
    let finish: (result: unknown) => void = () => {};
    wx.request.mockImplementation(({ url }) => {
      if (url.endsWith("/boards/old-board"))
        return new Promise((resolve) => {
          finish = resolve;
        });
      return Promise.resolve({
        statusCode: 200,
        data: {
          data: url.endsWith("/session")
            ? {
                accessToken: "group-B-token",
                expiresIn: 900,
                displayOpenGid: "verified-B",
              }
            : { id: "group-B" },
        },
      });
    });
    const old = api.groupApi.board("old-board");
    await vi.waitFor(() => expect(wx.request).toHaveBeenCalledTimes(3));
    api.invalidateGroupSession();
    await api.groupApi.currentGroup();
    finish({ statusCode: 401, data: { message: "old session expired" } });
    await expect(old).rejects.toThrow("old session expired");
    expect((await import("./group-display")).currentGroupDisplayId()).toBe(
      "verified-B",
    );
    await api.groupApi.currentGroup();
    expect(wx.login).toHaveBeenCalledTimes(2);
  });
});

it("formats submitted dates in Shanghai without depending on device timezone or Intl", () => {
  expect(formatSubmittedAt("2026-12-31T16:01:00Z")).toBe("2027-01-01 00:01");
});

it("saves public draft rules with login only, without acquiring group proof", async () => {
  wx.getEnterOptionsSync.mockReturnValue({ scene: 1001 });
  const definition = {
    name: "读书页数",
    unit: "页",
    aggregate: "latest",
    direction: "desc",
    period: "all_time",
  } as const;
  await api.groupApi.createDraft(definition, "draft-retry");
  expect(wx.getGroupEnterInfo).not.toHaveBeenCalled();
  expect(wx.request).toHaveBeenCalledWith(
    expect.objectContaining({
      method: "POST",
      url: "https://example.test/group-rank/drafts",
      data: { code: "transient-code", definition, requestId: "draft-retry" },
      header: {},
    }),
  );
});

it("scopes custom draft reads and board creation to the verified group", async () => {
  await api.groupApi.draft("opaque/id");
  await api.groupApi.createDraftBoard("opaque/id", "board-retry");
  expect(wx.request).toHaveBeenCalledWith(
    expect.objectContaining({
      url: "https://example.test/group-rank/drafts/opaque%2Fid",
      header: { Authorization: "Bearer group-A-token" },
    }),
  );
  expect(wx.request).toHaveBeenCalledWith(
    expect.objectContaining({
      url: "https://example.test/group-rank/boards",
      data: { draftId: "opaque/id", requestId: "board-retry" },
    }),
  );
});

it("keeps avatar downloads private, cached only within the current generation", async () => {
  wx.downloadFile.mockResolvedValue({
    statusCode: 200,
    tempFilePath: "wxfile://avatar",
  });
  await Promise.all([
    api.groupApi.avatar("user", "version"),
    api.groupApi.avatar("user", "version"),
  ]);
  expect(wx.downloadFile).toHaveBeenCalledTimes(1);
  expect(wx.downloadFile).toHaveBeenCalledWith(
    expect.objectContaining({
      header: { Authorization: "Bearer group-A-token" },
    }),
  );
  api.invalidateGroupSession();
  await api.groupApi.avatar("user", "version");
  expect(wx.downloadFile).toHaveBeenCalledTimes(2);
});
it("rejects an old group's avatar finishing after a group change", async () => {
  let finish: (value: unknown) => void = () => {};
  wx.downloadFile.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const pending = api.groupApi.avatar("user", "version");
  await vi.waitFor(() => expect(wx.downloadFile).toHaveBeenCalled());
  api.invalidateGroupSession();
  finish({ statusCode: 200, tempFilePath: "wxfile://old-private-avatar" });
  await expect(pending).rejects.toThrow("群已变化");
});
it("rejects oversized avatar before upload and permits nickname-only profile updates", async () => {
  wx.getFileInfo.mockResolvedValue({ size: 2097153 });
  await expect(
    api.groupApi.saveProfile("昵称", "wxfile://large"),
  ).rejects.toThrow("2MB");
  expect(wx.uploadFile).not.toHaveBeenCalled();
  await api.groupApi.saveProfile("");
  expect(wx.request).toHaveBeenCalledWith(
    expect.objectContaining({
      url: "https://example.test/group-rank/profile",
      method: "PATCH",
      data: { nickname: "" },
    }),
  );
});
it("does not apply an avatar upload completed after changing groups", async () => {
  wx.getFileInfo.mockResolvedValue({ size: 1024 });
  let finish: (value: unknown) => void = () => {};
  wx.uploadFile.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const pending = api.groupApi.saveProfile("昵称", "wxfile://avatar");
  await vi.waitFor(() => expect(wx.uploadFile).toHaveBeenCalled());
  api.invalidateGroupSession();
  finish({
    statusCode: 200,
    data: JSON.stringify({
      data: { userId: "old", nickname: "昵称", avatarVersion: "v2" },
    }),
  });
  await expect(pending).rejects.toThrow("群已变化");
});
it("keeps report, removal and avatar removal behind group authorization", async () => {
  await api.groupApi.report("board", "privacy");
  await api.groupApi.removeBoard("board");
  await api.groupApi.removeAvatar();
  expect(wx.request).toHaveBeenCalledWith(
    expect.objectContaining({
      url: "https://example.test/group-rank/boards/board/reports",
      method: "POST",
      data: { reason: "privacy" },
      header: { Authorization: "Bearer group-A-token" },
    }),
  );
  expect(wx.request).toHaveBeenCalledWith(
    expect.objectContaining({
      url: "https://example.test/group-rank/boards/board",
      method: "DELETE",
    }),
  );
  expect(wx.request).toHaveBeenCalledWith(
    expect.objectContaining({
      url: "https://example.test/group-rank/profile/avatar",
      method: "DELETE",
    }),
  );
});

it("does not upload old-group profile data if the group changes while inspecting the local file", async () => {
  let finish: (value: unknown) => void = () => {};
  wx.getFileInfo.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const pending = api.groupApi.saveProfile("旧群昵称", "wxfile://avatar");
  api.invalidateGroupSession();
  finish({ size: 1024 });
  await expect(pending).rejects.toThrow("群已变化");
  expect(wx.uploadFile).not.toHaveBeenCalled();
});

it("sends proxy writes and direct claims through verified group endpoints", async () => {
  await api.groupApi.proxySubmit("board/id", {
    name: "小林",
    value: "10",
    requestId: "one",
  });
  await api.groupApi.proxySubmit("board/id", {
    participantId: "participant/id",
    value: "12",
    requestId: "two",
  });
  await api.groupApi.proxyEntries("board/id", "participant/id");
  await api.groupApi.proxyEdit("board/id", "entry/id", "13", 2);
  await api.groupApi.proxyRemove("board/id", "entry/id");
  await api.groupApi.claim("board/id", "participant/id");
  const calls = wx.request.mock.calls.map(([options]) => options);
  expect(calls).toContainEqual(
    expect.objectContaining({
      url: "https://example.test/group-rank/boards/board%2Fid/proxy-entries",
      method: "POST",
      data: { name: "小林", value: "10", requestId: "one" },
    }),
  );
  expect(calls).toContainEqual(
    expect.objectContaining({
      data: { participantId: "participant/id", value: "12", requestId: "two" },
    }),
  );
  expect(calls).toContainEqual(
    expect.objectContaining({
      url: "https://example.test/group-rank/boards/board%2Fid/proxy-participants/participant%2Fid/entries",
      method: "GET",
    }),
  );
  expect(calls).toContainEqual(
    expect.objectContaining({
      url: "https://example.test/group-rank/boards/board%2Fid/proxy-entries/entry%2Fid",
      method: "PATCH",
      data: { value: "13", revision: 2 },
    }),
  );
  expect(calls).toContainEqual(
    expect.objectContaining({
      url: "https://example.test/group-rank/boards/board%2Fid/proxy-entries/entry%2Fid",
      method: "DELETE",
    }),
  );
  expect(calls).toContainEqual(
    expect.objectContaining({
      url: "https://example.test/group-rank/boards/board%2Fid/proxy-participants/participant%2Fid/claim",
      method: "POST",
      data: {},
    }),
  );
  expect(
    calls
      .filter((options) => !options.url.endsWith("/session"))
      .every(
        (options) => options.header.Authorization === "Bearer group-A-token",
      ),
  ).toBe(true);
});
it("blocks proxy writes and claims from the lobby even with a cached token", async () => {
  await api.groupApi.currentGroup();
  wx.getEnterOptionsSync.mockReturnValue({ scene: 1001 });
  wx.request.mockClear();
  await expect(
    api.groupApi.proxySubmit("old", {
      name: "小林",
      value: "1",
      requestId: "retry",
    }),
  ).rejects.toBeInstanceOf(api.GroupContextUnavailableError);
  await expect(api.groupApi.claim("old", "participant")).rejects.toBeInstanceOf(
    api.GroupContextUnavailableError,
  );
  expect(wx.request).not.toHaveBeenCalled();
});

it("saves board appearance using a group-authorized patch", async () => {
  await api.groupApi.setAppearance("board/id", "midnight");
  expect(wx.request).toHaveBeenCalledWith(
    expect.objectContaining({
      url: "https://example.test/group-rank/boards/board%2Fid/appearance",
      method: "PATCH",
      data: { themeId: "midnight" },
      header: { Authorization: "Bearer group-A-token" },
    }),
  );
});

it("requests title artwork only through the current authenticated group scope", async () => {
  await api.groupApi.titleArt("board/id");
  expect(wx.request).toHaveBeenCalledWith(
    expect.objectContaining({
      url: "https://example.test/group-rank/boards/board%2Fid/title-art",
      method: "GET",
      header: { Authorization: "Bearer group-A-token" },
    }),
  );
  wx.getEnterOptionsSync.mockReturnValue({ scene: 1001 });
  wx.request.mockClear();
  await expect(api.groupApi.titleArt("board/id")).rejects.toBeInstanceOf(
    api.GroupContextUnavailableError,
  );
  expect(wx.request).not.toHaveBeenCalled();
});

const photoChoice={assetId:'12345678-1234-4234-8234-123456789abc',cover:{x:.2,y:.8,zoom:1.3},card:{x:.8,y:.1,zoom:1},dim:.4};
it('uploads an optional background from the ordinary lobby using fresh author proof, without a group session',async()=>{
 wx.getEnterOptionsSync.mockReturnValue({scene:1001});wx.getFileInfo.mockResolvedValue({size:400});wx.uploadFile.mockResolvedValue({statusCode:201,data:JSON.stringify({data:{assetId:'approved',imageWidth:100,imageHeight:50}})});
 expect((await api.groupApi.uploadBackground('local-photo','retry')).assetId).toBe('approved');expect(wx.getGroupEnterInfo).not.toHaveBeenCalled();expect(wx.request).not.toHaveBeenCalled();expect(wx.uploadFile).toHaveBeenCalledWith(expect.objectContaining({url:'https://example.test/group-rank/backgrounds',filePath:'local-photo',name:'file',formData:{code:'transient-code',requestId:'retry'}}));
});
it('rejects oversized background input before login or upload',async()=>{wx.getFileInfo.mockResolvedValue({size:4*1024*1024+1});await expect(api.groupApi.uploadBackground('large','retry')).rejects.toThrow('4MB');expect(wx.login).not.toHaveBeenCalled();expect(wx.uploadFile).not.toHaveBeenCalled();});
it('preserves a failed image review as an error instead of applying it',async()=>{wx.getFileInfo.mockResolvedValue({size:400});wx.uploadFile.mockResolvedValue({statusCode:503,data:JSON.stringify({message:'图片审核暂不可用'})});await expect(api.groupApi.uploadBackground('local','retry')).rejects.toThrow('图片审核暂不可用');});
it('discards a completed background upload from a previous entry',async()=>{wx.getFileInfo.mockResolvedValue({size:400});let finish!:(v:any)=>void;wx.uploadFile.mockImplementation(()=>new Promise(resolve=>{finish=resolve;}));const pending=api.groupApi.uploadBackground('local','retry');const failed=pending.catch(error=>error);await vi.waitFor(()=>expect(wx.uploadFile).toHaveBeenCalled());api.invalidateGroupSession();finish({statusCode:201,data:JSON.stringify({data:{assetId:'old',imageWidth:10,imageHeight:10}})});expect(await failed).toBeInstanceOf(Error);});
it('submits only crop intent, never client-authoritative dimensions',async()=>{await api.groupApi.setAppearance('board','coral',{...photoChoice,imageWidth:999,imageHeight:999} as any);expect(wx.request).toHaveBeenCalledWith(expect.objectContaining({method:'PATCH',data:{themeId:'coral',background:photoChoice}}));});
it('downloads a private image with group proof, binds its version and clears caches on group changes',async()=>{wx.downloadFile.mockResolvedValue({statusCode:200,tempFilePath:'private-image'});await api.groupApi.background('board/id','asset-A');await api.groupApi.background('board/id','asset-A');expect(wx.downloadFile).toHaveBeenCalledTimes(1);expect(wx.downloadFile).toHaveBeenCalledWith({url:'https://example.test/group-rank/boards/board%2Fid/background?v=asset-A',header:{Authorization:'Bearer group-A-token'}});api.invalidateGroupSession();await api.groupApi.background('board/id','asset-A');expect(wx.downloadFile).toHaveBeenCalledTimes(2);});

it('does not reuse a cached private background from the ordinary lobby',async()=>{wx.downloadFile.mockResolvedValue({statusCode:200,tempFilePath:'private-image'});await api.groupApi.background('board','asset');wx.getEnterOptionsSync.mockReturnValue({scene:1001});await expect(api.groupApi.background('board','asset')).rejects.toBeInstanceOf(api.GroupContextUnavailableError);expect(wx.downloadFile).toHaveBeenCalledTimes(1);});

it("caches crop variants independently and fetches a new image after reframing", async () => {
  wx.downloadFile.mockResolvedValue({ statusCode: 200, tempFilePath: "private-image" });
  await api.groupApi.background("board", "asset", "card", "1-0.5,0.5,1");
  await api.groupApi.background("board", "asset", "card", "1-0.5,0.5,1");
  await api.groupApi.background("board", "asset", "cover", "1-0.5,0.5,1");
  await api.groupApi.background("board", "asset", "card", "1-0.1,0.5,1.4");
  expect(wx.downloadFile.mock.calls.map(([request]) => new URL(request.url).search)).toEqual([
    "?v=asset&slot=card&crop=1-0.5%2C0.5%2C1",
    "?v=asset&slot=cover&crop=1-0.5%2C0.5%2C1",
    "?v=asset&slot=card&crop=1-0.1%2C0.5%2C1.4",
  ]);
});

it('persists the explicit color choice separately from the background crop intent',async()=>{
  await api.groupApi.setAppearance('board','volt',photoChoice,'#F65D9B');
  expect(wx.request).toHaveBeenCalledWith(expect.objectContaining({method:'PATCH',data:{themeId:'volt',background:photoChoice,accentColor:'#F65D9B'}}));
  await api.groupApi.setAppearance('board','volt',undefined,null);
  expect(wx.request).toHaveBeenLastCalledWith(expect.objectContaining({method:'PATCH',data:{themeId:'volt',accentColor:null}}));
});
