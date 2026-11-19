// @vitest-environment jsdom
import { createElement, act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GroupRankBoardDto } from "@mono/types";

const wx = vi.hoisted(() => ({
  show: () => {},
  share: () => ({}),
  hide: () => {},
  getEnterOptionsSync: vi.fn(),
  login: vi.fn(),
  getGroupEnterInfo: vi.fn(),
  request: vi.fn(),
  navigateTo: vi.fn(),
  nextTick: (callback: () => void) => callback(),
  pageScrollTo: vi.fn(),
  reLaunch: vi.fn(),
  setNavigationBarTitle: vi.fn(),
  showModal: vi.fn(),
  getWindowInfo: vi.fn(),
  getMenuButtonBoundingClientRect: vi.fn(),
}));
vi.mock("@tarojs/taro", () => ({
  default: wx,
  usePageScroll: () => {},
  useDidShow: (callback: () => void) => {
    wx.show = callback;
  },
  useDidHide: (callback: () => void) => {
    wx.hide = callback;
  },
  useShareAppMessage: (callback: typeof wx.share) => { wx.share = callback; },
  useRouter: () => ({ params: { id: "A" } }),
}));
vi.mock("@tarojs/components", () => ({
  View: ({ catchMove, ...props }: any) => createElement("div", { ...props, "data-catch-move": catchMove ? "true" : undefined }),
  PageMeta: ({ pageStyle }: any) => createElement("meta", { "data-page-style": pageStyle }),
  RootPortal: ({ children }: any) => createElement("div", { "data-root-portal": true }, children),
  Text: "span",
  Slot: () => null,
  Image: "img",
  OpenData: ({ defaultText, type, openGid }: Record<string, string>) =>
    createElement(
      "span",
      { "data-open-type": type, "data-open-gid": openGid },
      defaultText,
    ),
  Button: ({
    openType,
    loading: _loading,
    hoverClass,
    hoverStartTime: _hoverStartTime,
    hoverStayTime: _hoverStayTime,
    ariaLabel,
    ...props
  }: Record<string, unknown>) => createElement("button", { ...props, "aria-label": ariaLabel, "data-hover-class": hoverClass, "data-open-type": openType }),
  Input: "input",
}));
vi.mock("../components/notebook-corner", async () => {
  const { useEffect, useRef } = await import("react");
  return {
    default({ turnPulse = 0, onTurn, children }: import("../components/notebook-corner").NotebookCornerProps) {
      const last = useRef(0);
      useEffect(() => {
        if (turnPulse && turnPulse !== last.current) onTurn(turnPulse < 0 ? -1 : 1);
        last.current = turnPulse;
      }, [turnPulse, onTurn]);
      return children;
    },
  };
});
import Home from "../pages/index/index";
import Board from "../pages/board/index";
import { resetEntryNavigation } from "./entry";
import { invalidateGroupSession } from "./api";

const template = {
  id: "running-distance",
  name: "跑步里程",
  unit: "km",
  description: "本月累计",
  period: "month",
  aggregate: "sum",
};
const board = (id: string, status: "open" | "closed" = "open") =>
  ({ id, status, template }) as GroupRankBoardDto;
let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
let boards: GroupRankBoardDto[];
beforeEach(() => {
  vi.clearAllMocks();
  wx.getWindowInfo.mockReset();
  wx.getMenuButtonBoundingClientRect.mockReset();
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal("GROUP_RANK_API_BASE_URL", "https://example.test/group-rank");
  resetEntryNavigation();
  invalidateGroupSession();
  wx.getEnterOptionsSync.mockReturnValue({ scene: 1001 });
  wx.login.mockResolvedValue({ code: "test" });
  wx.getGroupEnterInfo.mockResolvedValue({ encryptedData: "test", iv: "test" });
  wx.navigateTo.mockResolvedValue({});
  wx.showModal.mockResolvedValue({ confirm: true });
  boards = [];
  wx.request.mockImplementation(({ url }) => {
    const selected = boards.find(({ id }) => url.endsWith(`/boards/${id}`));
    return Promise.resolve({
      statusCode: 200,
      data: {
        data: url.endsWith("/templates")
          ? [template]
          : url.endsWith("/session")
            ? {
                accessToken: "test",
                expiresIn: 900,
                displayOpenGid: "verified-test-group",
              }
            : selected ? { ...selected, ranking: [], myEntries: [], myUserId: "me" } : { id: "B", memberCount: 2, boards },
      },
    });
  });
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  invalidateGroupSession();
  vi.unstubAllGlobals();
});
async function mount(component = Home) {
  await act(async () =>
    root.render(
      createElement(component) as unknown as Parameters<typeof root.render>[0],
    ),
  );
  await act(async () => wx.show());
}
async function clickButton(text: string) {
  const button = [...container.querySelectorAll("button")].find((item) =>
    item.textContent?.includes(text) || item.getAttribute("aria-label") === text,
  );
  expect(button).toBeDefined();
  await act(async () => button!.click());
}

describe("rendered entry journey with mocked WeChat/server", () => {
  it("offers a generic group card and a return path without reading group data", async () => {
    await mount();
    expect(container.textContent).toContain("博哥的小本儿");
    expect(container.textContent).toContain("每群一小本");
    expect(container.textContent).toContain("把卡片发到想用的群，再从群里点开。");
    expect(container.querySelector('button[data-open-type="share"]')?.textContent).toBe("发到微信群");
    expect(wx.share()).toEqual({
      title: "每群一小本 · 从群聊打开",
      path: "/pages/index/index",
      imageUrl: "/assets/share-cover.jpg",
    });
    expect(container.textContent).toContain("用个模板");
    expect(container.textContent).not.toContain("示例目录");
    expect(container.textContent).toContain("跑步里程");
    expect(wx.login).not.toHaveBeenCalled();
    await clickButton("已有榜单？");
    expect(wx.showModal).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "怎么回到榜单？",
        content: expect.stringMatching(/^在原来的群里，点聊天里的小本儿卡片/),
      }),
    );
    expect(wx.navigateTo).not.toHaveBeenCalled();
    await clickButton("先设计榜单");
    expect(wx.navigateTo).toHaveBeenLastCalledWith({ url: "/pages/create/index" });
    await clickButton("跑步里程");
    expect(wx.navigateTo).toHaveBeenLastCalledWith({ url: "/pages/create/index?template=running-distance" });
    expect(wx.login).not.toHaveBeenCalled();
  });
  it("opens this group's directory from the generic card without selecting or creating a board", async () => {
    wx.getEnterOptionsSync.mockReturnValue({ scene: 1008, chatType: 3 });
    boards = [board("B")];
    await mount();
    expect(container.textContent).not.toContain("每群一小本");
    expect(container.querySelectorAll(".group-board-list .directory-row")).toHaveLength(1);
    expect(container.querySelector(".notebook-page-number")).toBeNull();
    expect(wx.getGroupEnterInfo).toHaveBeenCalled();
    expect(wx.navigateTo).not.toHaveBeenCalled();
    expect(wx.request.mock.calls.some(([options]) => options.method === "POST" && options.url.endsWith("/boards"))).toBe(false);
  });
  it("opens the directory from group tools even when there is a sole running board", async () => {
    wx.getEnterOptionsSync.mockReturnValue({
      scene: 1158,
      query: { board: "stale", template: "stale" },
    });
    boards = [board("B"), board("history", "closed")];
    await mount();
    expect(wx.navigateTo).not.toHaveBeenCalled();
    expect(container.querySelectorAll(".group-board-list")).toHaveLength(1);
    expect(container.querySelectorAll(".directory-row")).toHaveLength(2);
    expect(container.textContent).not.toContain("已结束");
  });
  it("opens a tapped board on the directory route and returns with one quiet group refresh", async () => {
    wx.getEnterOptionsSync.mockReturnValue({ scene: 1158 });
    boards = [{ ...board("B"), template: { ...board("B").template, name: "尿酸王" } }, board("C")];
    await mount();
    const groupRequests = () => wx.request.mock.calls.filter(([options]) => options.url.endsWith("/current-group")).length;
    expect(groupRequests()).toBe(1);
    await clickButton("尿酸王");
    expect(container.querySelector(".page-frame-title")?.textContent).toBe("尿酸王");
    expect(groupRequests()).toBe(1);
    const request = wx.request.getMockImplementation()!;
    let release: (() => void) | undefined;
    wx.request.mockImplementation((options) => options.url.endsWith("/current-group")
      ? new Promise(resolve => { release = () => resolve(request(options)); })
      : request(options));
    await clickButton("上一页，目录");
    expect(container.querySelectorAll(".group-board-list .directory-row")).toHaveLength(2);
    expect(container.textContent).not.toContain("正在加载榜单列表");
    expect(groupRequests()).toBe(2);
    await act(async () => { release?.(); });
    expect(groupRequests()).toBe(2);
    expect(wx.navigateTo).not.toHaveBeenCalled();
    expect(wx.reLaunch).not.toHaveBeenCalled();
  });
  it("opens a preloaded corner turn inside the directory route and returns without navigating", async () => {
    wx.getEnterOptionsSync.mockReturnValue({ scene: 1158 });
    boards = [board("B")];
    const request = wx.request.getMockImplementation()!;
    wx.request.mockImplementation((options) => options.url.endsWith("/boards/B")
      ? Promise.resolve({ statusCode: 200, data: { data: {
        ...boards[0], ranking: [], myEntries: [], myUserId: "me",
      } } })
      : request(options));
    await mount();
    const page = container.querySelector(".home-content")!;
    function touch(type: string, x: number) {
      const event = new Event(type, { bubbles: true });
      const point = { clientX: x, clientY: 200 };
      Object.assign(event, { touches: type === "touchend" ? [] : [point], changedTouches: [point] });
      page.dispatchEvent(event);
    }
    await act(async () => {
      touch("touchstart", 240);
      touch("touchmove", 120);
      touch("touchend", 120);
    });
    expect(container.querySelector(".rank-empty")?.textContent).toBe("还没有成绩");
    expect(wx.navigateTo).not.toHaveBeenCalled();
    await clickButton("01 / 01");
    expect(container.querySelector(".group-board-list")).not.toBeNull();
    expect(wx.reLaunch).not.toHaveBeenCalled();
  });

  it("shows a list for several boards and expands new-play controls only on demand", async () => {
    wx.getEnterOptionsSync.mockReturnValue({ scene: 1158 });
    boards = [board("first"), board("second")];
    await mount();
    expect(wx.navigateTo).not.toHaveBeenCalled();
    expect(container.querySelector(".play-list")).toBeNull();
    await clickButton("展开官方示例");
    expect(container.querySelector(".play-list")).not.toBeNull();
  });
  it("keeps loaded examples visible when returning from their creation route", async () => {
    wx.getEnterOptionsSync.mockReturnValue({ scene: 1158 });
    boards = [board("first")];
    await mount();
    expect(container.querySelector(".examples-toggle")?.getAttribute("data-hover-class")).toBe("directory-link-pressed");
    await clickButton("展开官方示例");
    expect(container.querySelectorAll(".play-list .directory-row")).toHaveLength(1);
    await act(async () => container.querySelector<HTMLButtonElement>(".play-list .directory-row")!.click());
    expect(wx.navigateTo).toHaveBeenCalledWith({ url: "/pages/create/index?template=running-distance" });
    await act(async () => wx.hide());
    await act(async () => wx.show());
    expect(container.querySelectorAll(".play-list .directory-row")).toHaveLength(1);
    expect(container.querySelector(".page-skeleton")).toBeNull();
    expect(wx.request.mock.calls.filter(([options]) => options.url.endsWith("/templates"))).toHaveLength(1);
    await clickButton("收起官方示例");
    expect(container.querySelector(".play-list")).toBeNull();
  });
  it("finishes the initial public examples request across an in-place board return", async () => {
    wx.getEnterOptionsSync.mockReturnValue({ scene: 1158 });
    boards = [board("first")];
    const request = wx.request.getMockImplementation()!;
    let release: (() => void) | undefined;
    wx.request.mockImplementation(options => options.url.endsWith("/templates")
      ? new Promise(resolve => { release = () => resolve(request(options)); })
      : request(options));
    await mount();
    await act(async () => container.querySelector<HTMLButtonElement>(".group-board-list .directory-row")!.click());
    await clickButton("上一页，目录");
    await clickButton("展开官方示例");
    expect(container.querySelector(".page-skeleton")).not.toBeNull();
    await act(async () => { release?.(); });
    expect(container.querySelector(".page-skeleton")).toBeNull();
    expect(container.querySelectorAll(".play-list .directory-row")).toHaveLength(1);
  });
  it("waits for verified data, guides the first board from a generic card, then shows a populated directory", async () => {
    wx.getEnterOptionsSync.mockReturnValue({ scene: 1008, chatType: 3 });
    const request = wx.request.getMockImplementation()!;
    let release!: () => void;
    wx.request.mockImplementation(options => options.url.endsWith("/current-group")
      ? new Promise(resolve => { release = () => resolve(request(options)); })
      : request(options));
    await mount();
    expect(container.querySelector(".page-skeleton")).not.toBeNull();
    expect(container.textContent).not.toContain("新建第一张榜");
    await act(async () => release());
    expect(container.textContent).toContain("本群的小本儿");
    expect(container.querySelector(".home-directory-heading")).toBeNull();
    expect(container.querySelector(".play-list")).not.toBeNull();
    expect(wx.navigateTo).not.toHaveBeenCalled();
    expect(wx.request.mock.calls.some(([options]) => options.method === "POST" && options.url.endsWith("/boards"))).toBe(false);
    await clickButton("新建第一张榜");
    expect(wx.navigateTo).toHaveBeenLastCalledWith({ url: "/pages/create/index" });
    await clickButton("跑步里程");
    expect(wx.navigateTo).toHaveBeenLastCalledWith({ url: "/pages/create/index?template=running-distance" });

    boards = [board("first"), board("second")];
    wx.request.mockImplementation(request);
    await act(async () => wx.hide());
    await act(async () => wx.show());
    expect(container.textContent).not.toContain("新建第一张榜");
    expect(container.querySelector(".play-list")).toBeNull();
    expect(container.querySelectorAll(".directory-row")).toHaveLength(2);
  });
  it("a forwarded card suggests a play in B without requesting A's board or creating anything", async () => {
    wx.getEnterOptionsSync.mockReturnValue({
      scene: 1044,
      query: { board: "A", template: template.id },
    });
    boards = [board("B")];
    await mount();
    expect(container.textContent).toContain("这张榜单不在本群。");
    expect(container.textContent).toContain("群友分享的规则");
    expect(wx.navigateTo).not.toHaveBeenCalled();
    expect(
      wx.request.mock.calls.some(([options]) =>
        options.url.includes("/boards/") && !options.url.endsWith("/boards/B/title-art"),
      ),
    ).toBe(false);
    expect(
      wx.request.mock.calls.some(
        ([options]) =>
          options.url.endsWith("/boards") && options.method === "POST",
      ),
    ).toBe(false);
  });
  it("leaves a forwarded result in the destination directory, even if the link claims to carry rules", async () => {
    wx.getEnterOptionsSync.mockReturnValue({ scene: 1008, query: { board: "A", result: "1", template: template.id, draft: "other-rules" } });
    boards = [board("B")];
    await mount();
    expect(container.textContent).toContain("名次和成绩不计入本群");
    expect(container.textContent).not.toContain("群友分享的规则");
    expect(container.querySelector(".notebook-page-number")).toBeNull();
    expect(wx.request.mock.calls.some(([o]) => o.url.includes("/boards/A") || o.url.includes("/drafts/") || /\/boards$/.test(o.url) && o.method === "POST")).toBe(false);
  });
  it("still opens the exact result board in its source group", async () => {
    wx.getEnterOptionsSync.mockReturnValue({ scene: 1008, query: { board: "second", result: "1" } });
    boards = [board("first"), board("second")];
    await mount();
    expect(container.querySelector(".notebook-page-number")?.textContent).toBe("02 / 02");
    expect(container.textContent).not.toContain("名次和成绩不计入本群");
  });
  it("the same-group card opens its exact board among several", async () => {
    wx.getEnterOptionsSync.mockReturnValue({
      scene: 1044,
      query: { board: "second", template: template.id },
    });
    boards = [board("first"), board("second")];
    await mount();
    expect(container.querySelector(".notebook-page-number")?.textContent).toBe("02 / 02");
    expect(wx.navigateTo).not.toHaveBeenCalled();
  });
  it("returning via the ordinary entry clears group content and makes no group requests", async () => {
    wx.getEnterOptionsSync.mockReturnValue({ scene: 1158 });
    boards = [board("first"), board("second")];
    await mount();
    await act(async () => wx.hide());
    wx.getEnterOptionsSync.mockReturnValue({ scene: 1001 });
    act(() => invalidateGroupSession());
    resetEntryNavigation();
    wx.request.mockClear();
    await act(async () => wx.show());
    expect(container.textContent).toContain("博哥的小本儿");
    expect(container.textContent).not.toContain("位群友已进入");
    expect(
      wx.request.mock.calls.every(([options]) =>
        options.url.endsWith("/templates"),
      ),
    ).toBe(true);
  });
  it("a retained detail page re-enters through the home resolver without fetching old board data", async () => {
    await mount(Board);
    expect(wx.reLaunch).toHaveBeenCalledWith({ url: "/pages/index/index" });
    expect(wx.request).not.toHaveBeenCalled();
  });
  it("a group-proof failure stays a recoverable group error instead of pretending this is the lobby", async () => {
    wx.getEnterOptionsSync.mockReturnValue({ scene: 1158 });
    wx.getGroupEnterInfo.mockRejectedValue({ errMsg: "unavailable" });
    await mount();
    expect(container.textContent).toContain("暂时无法进入本群");
    expect(container.textContent).not.toContain("新建第一张榜");
    expect(container.querySelector(".play-list")).toBeNull();
    expect(wx.navigateTo).not.toHaveBeenCalled();
  });
});

it.each([false, true])("shows forwarded rules before new-board entry (existing board: %s)", async (hasBoard) => {
  wx.getEnterOptionsSync.mockReturnValue({
    scene: 1044,
    query: { board: "source-board", draft: "opaque-rules" },
  });
  boards = hasBoard ? [board("destination-board")] : [];
  const defaultRequest = wx.request.getMockImplementation()!;
  wx.request.mockImplementation((options) =>
    options.url.endsWith("/drafts/opaque-rules")
      ? Promise.resolve({
          statusCode: 200,
          data: {
            data: {
              id: "opaque-rules",
              template: { ...template, name: "自定义积分" },
              expiresAt: null,
            },
          },
        })
      : defaultRequest(options),
  );
  await mount();
  expect(container.textContent).toContain("自定义积分");
  expect(container.textContent).toContain("在本群创建");
  expect(container.textContent).not.toContain("新建第一张榜");
  expect(wx.navigateTo).not.toHaveBeenCalled();
  expect(
    wx.request.mock.calls.some(([options]) => options.url.includes("/boards/") && !options.url.endsWith("/boards/destination-board/title-art")),
  ).toBe(false);
  expect(
    wx.request.mock.calls.some(
      ([options]) =>
        options.url.endsWith("/boards") && options.method === "POST",
    ),
  ).toBe(false);
});

it("uses a verified same-group board before loading shared draft rules", async () => {
  wx.getEnterOptionsSync.mockReturnValue({
    scene: 1044,
    query: { board: "same", draft: "rules" },
  });
  boards = [board("same")];
  await mount();
  expect(container.querySelector(".notebook-page-number")?.textContent).toBe("01 / 01");
  expect(wx.navigateTo).not.toHaveBeenCalled();
  expect(
    wx.request.mock.calls.some(([options]) => options.url.includes("/drafts/")),
  ).toBe(false);
});

it("new custom ranking entry does not log in or create before the form is saved", async () => {
  await mount();
  await clickButton("先设计榜单");
  expect(wx.navigateTo).toHaveBeenCalledWith({ url: "/pages/create/index" });
  expect(wx.login).not.toHaveBeenCalled();
  expect(
    wx.request.mock.calls.some(([options]) => options.method === "POST"),
  ).toBe(false);
});

it("uses one real summary leader and preserves the actual joint-winner count", async () => {
  wx.getEnterOptionsSync.mockReturnValue({ scene: 1158 });
  boards = [
    {
      ...board("with-results"),
      themeId: "midnight",
      summary: {
        leaders: ["甲", "乙", "丙"].map((name) => ({
          userId: name,
          displayName: name,
          score: "123",
          rank: 1,
          avatarVersion: null,
        })),
        participantCount: 8,
        winnerCount: 5,
      },
    },
    {
      ...board("empty"),
      summary: { leaders: [], participantCount: 0, winnerCount: 0 },
    },
  ];
  await mount();
  const cards = container.querySelectorAll(".directory-row");
  expect(cards[0].className).toContain("theme--midnight");
  expect(cards[0].querySelector(".directory-row-result")?.textContent).toContain("甲");
  expect(cards[0].querySelector(".directory-folio-number")?.textContent).toBe("01");
  expect(cards[0].querySelector(".directory-score-value")?.textContent).toBe("123");
  expect(cards[0].querySelector(".directory-score-unit")?.textContent).toBe("km");
  expect(cards[0].textContent).toContain("5 位并列第一");
  expect(cards[0].querySelector(".directory-row-art")).toBeNull();
  expect(cards[0].querySelector(".score-card-followers")).toBeNull();
  expect(cards[0].querySelector(".notebook-rim")).toBeNull();
  expect(cards[1].textContent).toContain("还没有成绩");
  expect(cards[1].querySelector(".directory-score-value")).toBeNull();
  expect(cards[1].querySelector(".score-card-portrait")).toBeNull();
});
it("opens creation from a single public entry without a theme picker or group data", async () => {
  await mount();
  expect(container.querySelector(".theme-choices")).toBeNull();
  expect(container.querySelector(".theme-preview")).toBeNull();
  expect(
    [...container.querySelectorAll("button")].filter((node) =>
      node.textContent?.includes("先设计榜单"),
    ),
  ).toHaveLength(1);
  await clickButton("先设计榜单");
  expect(wx.navigateTo).toHaveBeenCalledWith({
    url: "/pages/create/index",
  });
  expect(wx.login).not.toHaveBeenCalled();
  expect(container.querySelector(".card-leader")).toBeNull();
  expect(container.querySelector(".person-avatar")).toBeNull();
  expect(container.textContent).not.toContain("位有成绩");
});

it("lists every board without lifecycle labels, filters, or invented grouping", async () => {
  wx.getEnterOptionsSync.mockReturnValue({ scene: 1158 });
  boards = [
    board("open"),
    { ...board("paused"), status: "paused" },
    board("closed", "closed"),
  ];
  await mount();
  const lists = container.querySelectorAll(".group-board-list");
  expect(lists).toHaveLength(1);
  expect(lists[0].querySelectorAll(".directory-row")).toHaveLength(3);
  expect(lists[0].querySelector(".board-list-status")).toBeNull();
  expect(container.textContent).not.toMatch(/进行中|已暂停|未结束|已结束/);
});

it("reserves physical native status and capsule space once in the shared header", async () => {
  wx.getWindowInfo.mockReturnValue({ statusBarHeight: 44, windowWidth: 390 });
  wx.getMenuButtonBoundingClientRect.mockReturnValue({
    top: 52,
    bottom: 84,
    left: 286,
    height: 32,
  });
  await mount();
  const frame = container.querySelector<HTMLElement>(".page-frame")!;
  expect(frame.style.getPropertyValue("--page-status-height")).toBe("44px");
  expect(frame.style.getPropertyValue("--page-capsule-clearance")).toBe(
    "112px",
  );
  expect(frame.style.getPropertyValue("--page-header-height")).toBe("48px");
  expect(container.querySelectorAll(".page-frame-header")).toHaveLength(1);
  expect(container.querySelector(".page-frame-header")?.textContent).toBe("博哥的小本儿");
  expect(container.querySelector(".brand-signature")?.textContent).toContain("博哥的小本儿");
  expect(wx.login).not.toHaveBeenCalled();
});
it("keeps a branded native header and one creation action in the group directory", async () => {
  wx.getEnterOptionsSync.mockReturnValue({ scene: 1158 });
  boards = [board("A"), board("B")];
  await mount();
  expect(container.querySelector(".brand-signature-name")?.textContent).toBe("博哥的小本儿");
  expect(container.querySelector(".home-directory-heading")?.textContent).toContain("目录");
  expect(container.querySelectorAll(".brand-mini-photo")).toHaveLength(1);
  const create = container.querySelector<HTMLButtonElement>(".group-create")!;
  expect(container.querySelectorAll(".group-create")).toHaveLength(1);
  await act(async () => create.click());
  expect(wx.navigateTo).toHaveBeenCalledWith({ url: "/pages/create/index" });
});
it("falls back to zero native inset when the host window API throws", async () => {
  wx.getWindowInfo.mockImplementation(() => {
    throw new Error("host unsupported");
  });
  await mount();
  const frame = container.querySelector<HTMLElement>(".page-frame")!;
  expect(frame.style.getPropertyValue("--page-status-height")).toBe("0px");
  expect(frame.style.getPropertyValue("--page-capsule-clearance")).toBe("0px");
  expect(container.textContent).toContain("发到微信群");
});
