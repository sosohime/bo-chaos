// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { GroupRankEntryDto, GroupRankRecommendationRow } from "@mono/types";
import TitleArtwork from "../components/title-artwork";

const state = vi.hoisted(() => ({
  ready: () => {},
  nextTick: vi.fn(),
  offerReturnHelp: vi.fn(),
  sheetScrolled: (_event: { detail: { scrollTop: number } }) => {},
  windowInfo: vi.fn(),
  keyboardChanged: (_event: { height: number }) => {},
  windowResized: (_event: { size: { windowHeight: number; windowWidth: number } }) => {},
  offKeyboard: vi.fn(),
  offResize: vi.fn(),
  pageScrollTo: vi.fn(),
  scroll: (_event: { scrollTop: number }) => {},
  show: () => {},
  hide: () => {},
  share: (_event?: { from?: string; target?: object }) => ({}) as Record<string, unknown>,
  params: {} as Record<string, string>,
  entry: { kind: "lobby" },
  navigation: false,
  generation: 0,
  canIUse: vi.fn(),
  setNavigationBarColor: vi.fn(),
  fields: new Map<string, Record<string, any>>(),
  form: (_event: any) => {},
  avatar: (_event: any) => {},
  picker: (_event: any) => {},
  titleArt: vi.fn(),
  createDraft: vi.fn(),
  createDraftBoard: vi.fn(),
  templates: vi.fn(),
  saveProfile: vi.fn(),
  removeAvatar: vi.fn(),
  redirectTo: vi.fn(),
  reLaunch: vi.fn(),
  downloadAvatar: vi.fn(),
  board: vi.fn(),
  currentGroup: vi.fn(),
  recommend: vi.fn(),
  withdrawRecommendation: vi.fn(),
  submit: vi.fn(),
  edit: vi.fn(),
  remove: vi.fn(),
  proxySubmit: vi.fn(),
  proxyEdit: vi.fn(),
  proxyRemove: vi.fn(),
  proxyEntries: vi.fn(),
  claim: vi.fn(),
  setAppearance: vi.fn(),
  removeBoard: vi.fn(),
  report: vi.fn(),
  showModal: vi.fn(),
  showActionSheet: vi.fn(),
  showToast: vi.fn(),
}));
vi.mock("@tarojs/taro", () => ({
  default: {
    nextTick: state.nextTick,
    useReady: (callback: () => void) => { state.ready = callback; },
    getWindowInfo: state.windowInfo,
    onKeyboardHeightChange: (callback: typeof state.keyboardChanged) => { state.keyboardChanged = callback; },
    onWindowResize: (callback: typeof state.windowResized) => { state.windowResized = callback; },
    offKeyboardHeightChange: state.offKeyboard,
    offWindowResize: state.offResize,
    canIUse: state.canIUse,
    setNavigationBarColor: state.setNavigationBarColor,
    redirectTo: state.redirectTo,
    reLaunch: state.reLaunch,
    setNavigationBarTitle: vi.fn(),
    pageScrollTo: state.pageScrollTo,
    showToast: state.showToast,
    showModal: state.showModal,
    showActionSheet: state.showActionSheet,
  },
  usePageScroll: (callback: typeof state.scroll) => { state.scroll = callback; },
  useDidShow: (callback: () => void) => {
    state.show = callback;
  },
  useDidHide: (callback: () => void) => {
    state.hide = callback;
  },
  useRouter: () => ({ params: state.params }),
  useShareAppMessage: (callback: typeof state.share) => {
    state.share = callback;
  },
}));
vi.mock("./return-guide", () => ({
  offerGroupReturnHelp: state.offerReturnHelp,
  showGroupReturnHelp: vi.fn(),
}));
vi.mock("./entry", () => ({
  currentEntry: () => state.entry,
  needsEntryNavigation: () => state.navigation,
}));
vi.mock("./api", () => ({
  currentGroupGeneration: () => state.generation,
  newRequestId: (() => {
    let id = 0;
    return () => `retry-${++id}`;
  })(),
  groupApi: {
    titleArt: state.titleArt,
    createDraft: state.createDraft,
    createDraftBoard: state.createDraftBoard,
    templates: state.templates,
    saveProfile: state.saveProfile,
    removeAvatar: state.removeAvatar,
    avatar: state.downloadAvatar,
    board: state.board,
    currentGroup: state.currentGroup,
    recommend: state.recommend,
    withdrawRecommendation: state.withdrawRecommendation,
    submit: state.submit,
    edit: state.edit,
    remove: state.remove,
    proxySubmit: state.proxySubmit,
    proxyEdit: state.proxyEdit,
    proxyRemove: state.proxyRemove,
    proxyEntries: state.proxyEntries,
    claim: state.claim,
    setAppearance: state.setAppearance,
    removeBoard: state.removeBoard,
    report: state.report,
  },
}));
vi.mock("@tarojs/components", () => ({
  Picker: ({ onChange, children, range }: Record<string, any>) => {
    state.picker = onChange;
    return createElement(
      "div",
      { "data-picker-options": JSON.stringify(range) },
      children,
    );
  },
  ScrollView: ({ scrollY, scrollTop, scrollIntoView, scrollWithAnimation, onScroll, ...props }: any) => {
    if(onScroll)state.sheetScrolled=onScroll;
    return createElement("div", { ...props, "data-scroll-target": scrollIntoView, "data-scroll-top": scrollTop });
  },
  View: ({ catchMove, ...props }: any) => createElement("div", { ...props, "data-catch-move": catchMove ? "true" : undefined }),
  PageMeta: ({ pageStyle, scrollTop, scrollDuration }: any) => createElement("meta", { "data-page-style": pageStyle, "data-scroll-top": scrollTop, "data-scroll-duration": scrollDuration }),
  RootPortal: ({ children }: any) => createElement("div", { "data-root-portal": true }, children),
  Text: "span",
  Image: "img",
  Button: ({
    openType,
    onChooseAvatar,
    loading: _loading,
    hoverClass: _hoverClass,
    hoverStartTime: _hoverStartTime,
    hoverStayTime: _hoverStayTime,
    formType,
    ariaLabel,
    ...props
  }: Record<string, any>) => {
    if (openType === "chooseAvatar") state.avatar = onChooseAvatar;
    return createElement("button", {
      ...props,
      type: formType,
      "aria-label": ariaLabel,
      "data-open-type": openType,
    });
  },
  Input: (props: Record<string, any>) => {
    state.fields.set(props.name || props.placeholder, props);
    return createElement("input", {
      value: props.value,
      readOnly: true,
      name: props.name,
      placeholder: props.placeholder,
    });
  },
  Textarea: (props: Record<string, any>) => {
    state.fields.set(props.ariaLabel, props);
    return createElement("textarea", { value: props.value, readOnly: true, "aria-label": props.ariaLabel });
  },
  Form: ({ onSubmit, children, ...props }: Record<string, any>) => {
    state.form = onSubmit;
    return createElement("div", props, children);
  },
}));
import ScoreValue from "../components/score-value";
import { Podium } from "../components/scoreboard";
vi.mock("../components/notebook-corner", async () => {
  const { useEffect, useRef, createElement: element } = await import("react");
  return {
    default({ label, turnPulse = 0, onTurn, children }: import("../components/notebook-corner").NotebookCornerProps) {
      const previous = useRef(0);
      useEffect(() => {
        if (turnPulse && turnPulse !== previous.current) onTurn(turnPulse < 0 ? -1 : 1);
        previous.current = turnPulse;
      }, [turnPulse, onTurn]);
      return element("notebook-corner", { label }, children);
    },
  };
});
import Board from "../pages/board/index";
import Create from "../pages/create/index";
import ProxySheet from "../components/proxy-sheet";
import ProfileSheet from "../components/profile-sheet";
let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  state.pageScrollTo.mockResolvedValue({});
  state.nextTick.mockImplementation((callback: () => void) => callback());
  state.fields.clear();
  state.params = {};
  state.entry = { kind: "lobby" };
  state.navigation = false;
  state.generation = 0;
  state.canIUse.mockReturnValue(true);
  state.titleArt.mockRejectedValue(new Error("art unavailable"));
  state.createDraft.mockResolvedValue({
    id: "opaque",
    template: { name: "书页" },
    expiresAt: "2026-11-01",
  });
  state.createDraftBoard.mockResolvedValue({ id: "new-board" });
  state.templates.mockResolvedValue([]);
  state.proxyEntries.mockResolvedValue([]);
  state.downloadAvatar.mockRejectedValue(new Error("no image"));
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});
async function mountCreate() {
  await act(async () => root.render(createElement(Create) as any));
  await act(async () => state.show());
}
async function input(field: string, value: string) {
  if (
    field === "填写数值" &&
    !container.querySelector('input[placeholder="填写数值"]')
  )
    await click("记一笔");
  await act(async () =>
    state.fields.get(field)!.onInput({ detail: { value } }),
  );
}
async function click(text: string) {
  if (text === "···") text = "更多";
  if (["帮群友记", "榜单外观"].includes(text) && !container.querySelector(".create-screen") && ![...container.querySelectorAll("button")].some(element => element.textContent?.includes(text))) await click("更多");
  const matches = [...container.querySelectorAll("button")].filter((element) =>
    element.textContent?.includes(text) || element.getAttribute("aria-label") === text || (text === "记一笔" && element.textContent === "记第一笔"),
  );
  const button = text === "关闭" ? matches[matches.length - 1] : matches[0];
  expect(button).toBeDefined();
  await act(async () => button!.click());
}
it("saves lobby rules only after a name is entered and shares an opaque reference", async () => {
  await mountCreate();
  expect(container.querySelector(".rules-content")).toBeNull();
  await click("展开计分规则");
  const aggregateButtons = [...container.querySelectorAll("button")].filter(
    (button) => ["取最高", "取最新", "累计"].includes(button.textContent || ""),
  );
  expect(aggregateButtons.map((button) => button.textContent)).toEqual([
    "取最高", "取最新", "累计",
  ]);
  expect(aggregateButtons[0]?.classList.contains("chosen")).toBe(true);
  expect(state.createDraft).not.toHaveBeenCalled();
  await click("保存并继续");
  expect(container.textContent).toContain("给榜单起个名字");
  expect(state.createDraft).not.toHaveBeenCalled();
  await input("榜单名称", "  读书页数  ");
  await click("保存并继续");
  expect(state.createDraft).toHaveBeenCalledWith(
    {
      name: "读书页数",
      unit: "",
      aggregate: "max",
      direction: "desc",
      period: "all_time",
      themeId: "volt",
    },
    expect.any(String),
  );
  expect(state.createDraftBoard).not.toHaveBeenCalled();
  expect(container.textContent).toContain("发到微信群");
  expect(state.share()).toEqual({
    title: "书页｜在群里建榜",
    path: "/pages/index/index?draft=opaque",
    imageUrl: "/assets/share-cover.jpg",
  });
  expect(container.querySelector('input[placeholder="榜单名称"]')).toBeNull();
  await click("返回修改规则");
  expect(state.fields.get("榜单名称")?.value).toBe("  读书页数  ");
  expect(state.share().path).toBe("/pages/index/index");
  await click("保存并继续");
  expect(state.createDraft).toHaveBeenCalledTimes(1);
  expect(state.share().path).toBe("/pages/index/index?draft=opaque");
});
it("retains draft retry keys but generates fresh keys after editing its definition", async () => {
  await mountCreate();
  await input("榜单名称", "积分");
  state.createDraft.mockRejectedValue(new Error("网络中断"));
  await click("保存并继续");
  await click("保存并继续");
  const first = state.createDraft.mock.calls[0][1];
  expect(state.createDraft.mock.calls[1][1]).toBe(first);
  await input("选填", "分");
  await click("保存并继续");
  expect(state.createDraft.mock.calls[2][1]).not.toBe(first);
  expect(state.fields.get("榜单名称")!.value).toBe("积分");
});
it("retries group board creation without making a second draft or a new board request key", async () => {
  state.entry = { kind: "group-tool" };
  await mountCreate();
  await input("榜单名称", "积分");
  state.createDraftBoard.mockRejectedValueOnce(new Error("创建结果未返回"));
  await click("创建榜单");
  expect(container.textContent).toContain("创建结果未返回");
  await click("创建榜单");
  expect(state.createDraft).toHaveBeenCalledTimes(1);
  expect(state.createDraftBoard.mock.calls[0]).toEqual(
    state.createDraftBoard.mock.calls[1],
  );
  expect(state.redirectTo).toHaveBeenCalledWith({
    url: "/pages/board/index?id=new-board",
  });
});
it("re-enters through the home resolver when an old form resumes under a new entry", async () => {
  state.navigation = true;
  state.entry = { kind: "group-card" };
  await mountCreate();
  expect(state.reLaunch).toHaveBeenCalledWith({ url: "/pages/index/index" });
  expect(state.createDraft).not.toHaveBeenCalled();
  expect(state.createDraftBoard).not.toHaveBeenCalled();
});
it("does not create in a newly entered group after a public draft response finishes late", async () => {
  state.entry = { kind: "group-tool" };
  await mountCreate();
  await input("榜单名称", "积分");
  let finish: (value: unknown) => void = () => {};
  state.createDraft.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await click("创建榜单");
  await act(async () => state.hide());
  await act(async () => finish({ id: "old-rules" }));
  expect(state.createDraftBoard).not.toHaveBeenCalled();
  expect(state.redirectTo).not.toHaveBeenCalled();
});

async function mountProfile(
  continuing = false,
  profile = {
    userId: "me",
    nickname: null as string | null,
    avatarVersion: null as string | null,
  },
) {
  const saved = vi.fn(),
    close = vi.fn();
  await act(async () =>
    root.render(
      createElement(ProfileSheet, {
        profile,
        continuing,
        onClose: close,
        onSaved: saved,
        onUpdated: vi.fn(),
      }) as any,
    ),
  );
  return { saved, close };
}
it("requires both chosen identity fields before contribution and offers no pseudonym bypass", async () => {
  await mountProfile(true);
  expect(container.textContent).not.toContain("先用群友代号提交");
  await act(async () => state.form({ detail: { value: { nickname: "" } } }));
  expect(container.textContent).toContain("选择或填写昵称");
  expect(state.saveProfile).not.toHaveBeenCalled();
  await act(async () =>
    state.form({ detail: { value: { nickname: "群友昵称" } } }),
  );
  expect(container.textContent).toContain("请选择头像");
  expect(state.saveProfile).not.toHaveBeenCalled();
});

it("automatically continues one save after delayed review using the submitted native form value", async () => {
  const { saved } = await mountProfile();
  await input("nickname", "候选昵称");
  state.saveProfile.mockResolvedValue({
    userId: "me",
    nickname: "最新昵称",
    avatarVersion: null,
  });
  await act(async () =>
    state.form({ detail: { value: { nickname: "最新昵称" } } }),
  );
  expect(state.saveProfile).not.toHaveBeenCalled();
  expect(container.textContent).toContain("正在检查昵称");
  expect(state.fields.get("nickname")!.disabled).toBe(true);
  await input("nickname", "等待期间的旧事件");
  expect(state.fields.get("nickname")!.value).toBe("候选昵称");
  await act(async () =>
    state.fields.get("nickname")!.onNickNameReview({ detail: { pass: true } }),
  );
  expect(state.saveProfile).toHaveBeenCalledTimes(1);
  expect(state.saveProfile).toHaveBeenCalledWith("最新昵称", undefined);
  expect(saved).toHaveBeenCalledWith({
    userId: "me",
    nickname: "最新昵称",
    avatarVersion: null,
  });
});

it("keeps selected avatar and entered name on failed save, without continuing the score", async () => {
  const { saved } = await mountProfile();
  await input("nickname", "朋友");
  await act(async () =>
    state.fields.get("nickname")!.onNickNameReview({ detail: { pass: true } }),
  );
  await act(async () =>
    state.avatar({ detail: { avatarUrl: "wxfile://chosen" } }),
  );
  state.saveProfile.mockRejectedValue(new Error("头像审核未通过"));
  await act(async () =>
    state.form({ detail: { value: { nickname: "朋友" } } }),
  );
  expect(saved).not.toHaveBeenCalled();
  expect(container.textContent).toContain("头像审核未通过");
  expect(state.fields.get("nickname")!.value).toBe("朋友");
  expect(container.querySelector("img")?.getAttribute("src")).toBe(
    "wxfile://chosen",
  );
});
it("supports an optional avatar with an empty nickname and continues only after saving", async () => {
  const { saved } = await mountProfile();
  await act(async () =>
    state.avatar({ detail: { avatarUrl: "wxfile://chosen" } }),
  );
  state.saveProfile.mockResolvedValue({
    userId: "me",
    nickname: null,
    avatarVersion: "v2",
  });
  await act(async () => state.form({ detail: { value: { nickname: "" } } }));
  expect(state.saveProfile).toHaveBeenCalledWith("", "wxfile://chosen");
  expect(saved).toHaveBeenCalledWith({
    userId: "me",
    nickname: null,
    avatarVersion: "v2",
  });
});

async function mountBoard(overrides: Record<string, unknown> = {}) {
  state.params = { id: "custom-board" };
  state.entry = { kind: "group-tool" };
  state.currentGroup.mockResolvedValue({ boards: [{ id: "custom-board" }] });
  state.board.mockResolvedValue({
    id: "custom-board",
    draftId: "rules",
    creatorId: "me",
    myUserId: "me",
    status: "open",
    template: {
      name: "读书页数",
      description: "记录最近一次",
      metric: "填写数值",
      unit: "页",
      min: "0",
      max: "999999999",
      precision: 3,
      direction: "desc",
      period: "all_time",
    },
    myProfile: { userId: "me", nickname: null, avatarVersion: null },
    ranking: [],
    myEntries: [],
    historyHasMore: false,
    ...overrides,
  });
  state.submit.mockResolvedValue({ id: "entry" });
  await act(async () => root.render(createElement(Board) as any));
  await act(async () => state.show());
}
it("shares the current board from the menu and opts in to the current rank only from the rank button", async () => {
  await mountBoard({ myProfile: { userId: "me", nickname: "榜上昵称", avatarVersion: "v1" } });
  expect(state.share({ from: "menu" }).title).toBe("读书页数｜本群榜单");
  await click("分享");
  expect(container.querySelector('[data-share-kind="own-rank"]')).toBeNull();
  await click("关闭");
  const updated = await state.board();
  state.board.mockResolvedValue({
    ...updated,
    myProfile: { userId: "me", nickname: "榜上昵称", avatarVersion: "v1" },
    ranking: [{ userId: "me", displayName: "榜上昵称", score: "520", rank: 2 }],
  });
  await input("填写数值", "520");
  await click("保存成绩");
  expect(state.submit).toHaveBeenCalledTimes(1);
  await click("分享");
  const button = container.querySelector<HTMLButtonElement>('[data-share-kind="own-rank"]')!;
  expect(button.textContent).toContain("我排第 2 名｜读书页数");
  expect(state.share({ from: "button", target: { dataset: button.dataset } })).toMatchObject({
    title: "我排第 2 名｜读书页数",
    path: "/pages/index/index?board=custom-board&result=1",
  });
  expect(state.share({ from: "menu" }).title).toBe("读书页数｜本群榜单");
  await click("右上角分享带我的成绩");
  expect(state.share({ from: "menu" }).title).toContain("520");
  expect(state.share({ from: "menu" }).path).toBe("/pages/index/index?board=custom-board&result=1");
  await click("右上角分享带我的成绩");
  expect(state.share({ from: "menu" }).title).toBe("读书页数｜本群榜单");
});

it.each([
  { userId: "me", nickname: null, avatarVersion: "v1" },
  { userId: "me", nickname: "群友昵称", avatarVersion: null },
])(
  "requires each missing profile field before a new contribution: %j",
  async (profile) => {
    await mountBoard({ myProfile: profile });
    await input("填写数值", "12");
    await click("保存成绩");
    expect(container.textContent).toContain("先设置头像和昵称");
    expect(state.submit).not.toHaveBeenCalled();
    await click("关闭");
    await click("保存成绩");
    expect(container.textContent).toContain("先设置头像和昵称");
    expect(state.submit).not.toHaveBeenCalled();
  },
);
it("continues the pending score only after both fields save successfully and retains score after failures", async () => {
  await mountBoard();
  await input("填写数值", "12");
  await click("保存成绩");
  await act(async () =>
    state.avatar({ detail: { avatarUrl: "wxfile://chosen" } }),
  );
  state.saveProfile.mockRejectedValueOnce(new Error("审核失败"));
  await act(async () =>
    state.form({ detail: { value: { nickname: "群友昵称" } } }),
  );
  expect(state.submit).not.toHaveBeenCalled();
  expect(state.fields.get("填写数值")!.value).toBe("12");
  state.saveProfile.mockResolvedValueOnce({
    userId: "me",
    nickname: "群友昵称",
    avatarVersion: "v2",
  });
  await act(async () =>
    state.form({ detail: { value: { nickname: "群友昵称" } } }),
  );
  expect(state.submit).toHaveBeenCalledWith(
    "custom-board",
    "12",
    expect.any(String),
  );
});

it("does not submit a score when changing profile from its permanent entry", async () => {
  await mountBoard();
  await input("填写数值", "18");
  await click("关闭");
  await click("头像昵称");
  state.saveProfile.mockResolvedValue({
    userId: "me",
    nickname: null,
    avatarVersion: null,
  });
  await act(async () => state.form({ detail: { value: { nickname: "" } } }));
  expect(state.submit).not.toHaveBeenCalled();
  expect(state.fields.get("填写数值")!.value).toBe("18");
});
it("requires confirmation to remove a board and returns to the group home only after success", async () => {
  await mountBoard();
  await click("更多");
  state.showModal.mockResolvedValueOnce({ confirm: false });
  await click("移除榜单");
  expect(state.removeBoard).not.toHaveBeenCalled();
  state.showModal.mockResolvedValueOnce({ confirm: true });
  state.removeBoard.mockResolvedValue({ removed: true });
  await click("移除榜单");
  expect(state.removeBoard).toHaveBeenCalledWith("custom-board");
  expect(state.reLaunch).toHaveBeenCalledWith({ url: "/pages/index/index" });
});

it("does not silently save a nickname cleared by failed platform review", async () => {
  await mountProfile();
  await input("nickname", "候选昵称");
  await act(async () =>
    state.fields.get("nickname")!.onNickNameReview({ detail: { pass: false } }),
  );
  await act(async () => state.form({ detail: { value: { nickname: "" } } }));
  expect(state.saveProfile).not.toHaveBeenCalled();
  expect(container.textContent).toContain("没有通过检查");
  await input("nickname", "");
  state.saveProfile.mockResolvedValue({
    userId: "me",
    nickname: null,
    avatarVersion: null,
  });
  await act(async () => state.form({ detail: { value: { nickname: "" } } }));
  expect(state.saveProfile).toHaveBeenCalledWith("", undefined);
});

it("stops a pending save on review failure and preserves the selected avatar and name", async () => {
  const { saved } = await mountProfile();
  await input("nickname", "候选昵称");
  await act(async () =>
    state.avatar({ detail: { avatarUrl: "wxfile://chosen" } }),
  );
  await act(async () =>
    state.form({ detail: { value: { nickname: "候选昵称" } } }),
  );
  await act(async () =>
    state.fields.get("nickname")!.onNickNameReview({ detail: { pass: false } }),
  );
  expect(state.saveProfile).not.toHaveBeenCalled();
  expect(saved).not.toHaveBeenCalled();
  expect(container.textContent).toContain("没有通过检查");
  expect(state.fields.get("nickname")!.value).toBe("候选昵称");
  expect(state.fields.get("nickname")!.disabled).toBe(false);
  expect(container.querySelector("img")?.getAttribute("src")).toBe(
    "wxfile://chosen",
  );
});
it("bounds a missing review callback with a recoverable timeout and never submits", async () => {
  vi.useFakeTimers();
  await mountProfile();
  await input("nickname", "候选昵称");
  await act(async () =>
    state.form({ detail: { value: { nickname: "候选昵称" } } }),
  );
  await act(async () => vi.advanceTimersByTime(5000));
  expect(state.saveProfile).not.toHaveBeenCalled();
  expect(container.textContent).toContain("昵称检查超时");
  expect(state.fields.get("nickname")!.disabled).toBe(false);
});
it("lets an older platform send the native form value directly to mandatory server moderation", async () => {
  state.canIUse.mockReturnValue(false);
  const { saved } = await mountProfile();
  await input("nickname", "候选昵称");
  state.saveProfile.mockResolvedValue({
    userId: "me",
    nickname: "原生表单昵称",
    avatarVersion: null,
  });
  await act(async () =>
    state.form({ detail: { value: { nickname: "原生表单昵称" } } }),
  );
  expect(state.canIUse).toHaveBeenCalledWith("input.bindnicknamereview");
  expect(state.saveProfile).toHaveBeenCalledWith("原生表单昵称", undefined);
  expect(saved).toHaveBeenCalledTimes(1);
});
it("cancels a pending save when closing the sheet despite a later review pass", async () => {
  const { close, saved } = await mountProfile();
  await input("nickname", "候选昵称");
  await act(async () =>
    state.form({ detail: { value: { nickname: "候选昵称" } } }),
  );
  await click("关闭");
  expect(close).toHaveBeenCalledTimes(1);
  await act(async () =>
    state.fields.get("nickname")!.onNickNameReview({ detail: { pass: true } }),
  );
  expect(state.saveProfile).not.toHaveBeenCalled();
  expect(saved).not.toHaveBeenCalled();
});
it("cancels pending review work and timers when the sheet unmounts", async () => {
  vi.useFakeTimers();
  const { saved } = await mountProfile();
  await input("nickname", "候选昵称");
  await act(async () =>
    state.form({ detail: { value: { nickname: "候选昵称" } } }),
  );
  const reviewCallback = state.fields.get("nickname")!.onNickNameReview;
  await act(async () => root.render(null));
  expect(vi.getTimerCount()).toBe(0);
  await act(async () => reviewCallback({ detail: { pass: true } }));
  expect(state.saveProfile).not.toHaveBeenCalled();
  expect(saved).not.toHaveBeenCalled();
});
it("does not continue old-group intent after the foreground generation changes", async () => {
  const { saved } = await mountProfile();
  await input("nickname", "候选昵称");
  await act(async () =>
    state.form({ detail: { value: { nickname: "候选昵称" } } }),
  );
  state.generation += 1;
  await act(async () =>
    state.fields.get("nickname")!.onNickNameReview({ detail: { pass: true } }),
  );
  expect(state.saveProfile).not.toHaveBeenCalled();
  expect(saved).not.toHaveBeenCalled();
});
it("cancels pending review on page hide", async () => {
  const { saved } = await mountProfile();
  await input("nickname", "候选昵称");
  await act(async () =>
    state.form({ detail: { value: { nickname: "候选昵称" } } }),
  );
  await act(async () => state.hide());
  await act(async () =>
    state.fields.get("nickname")!.onNickNameReview({ detail: { pass: true } }),
  );
  expect(state.saveProfile).not.toHaveBeenCalled();
  expect(saved).not.toHaveBeenCalled();
});

it.each([
  { userId: "me", nickname: null, avatarVersion: "v2" },
  { userId: "me", nickname: "群友昵称", avatarVersion: null },
])(
  "keeps the original score and panel when saved profile remains incomplete: %j",
  async (saved) => {
    await mountBoard();
    await input("填写数值", "25");
    await click("保存成绩");
    await act(async () =>
      state.avatar({ detail: { avatarUrl: "wxfile://chosen" } }),
    );
    state.saveProfile.mockResolvedValue(saved);
    await act(async () =>
      state.form({ detail: { value: { nickname: "群友昵称" } } }),
    );
    expect(state.submit).not.toHaveBeenCalled();
    expect(state.fields.get("填写数值")!.value).toBe("25");
    expect(container.textContent).toContain("先设置头像和昵称");
    expect(container.textContent).toContain("还没有保存成功");
  },
);
it("accepts an existing saved avatar with a newly provided nickname", async () => {
  const { saved } = await mountProfile(true, {
    userId: "me",
    nickname: null,
    avatarVersion: "v1",
  });
  state.saveProfile.mockResolvedValue({
    userId: "me",
    nickname: "群友昵称",
    avatarVersion: "v1",
  });
  await act(async () =>
    state.form({ detail: { value: { nickname: "群友昵称" } } }),
  );
  expect(state.saveProfile).toHaveBeenCalledWith("群友昵称", undefined);
  expect(saved).toHaveBeenCalledTimes(1);
});
it.each([
  { userId: "me", nickname: null, avatarVersion: "v1" },
  { userId: "me", nickname: "群友昵称", avatarVersion: null },
])(
  "requires complete identity before editing existing scores: %j",
  async (profile) => {
    await mountBoard({
      myProfile: profile,
      myEntries: [
        {
          id: "old",
          value: "3",
          revision: 1,
          createdAt: "2026-10-30T08:00:00Z",
        },
      ],
    });
    await click("我的成绩记录");
    const edit = [...container.querySelectorAll("button")].find(
      (button) => button.textContent === "修改",
    );
    await act(async () => edit!.click());
    await input("填写数值", "9");
    await click("保存");
    expect(state.edit).not.toHaveBeenCalled();
    expect(container.textContent).toContain("先设置头像和昵称");
    await act(async () =>
      state.avatar({ detail: { avatarUrl: "wxfile://chosen" } }),
    );
    state.saveProfile.mockResolvedValue({
      userId: "me",
      nickname: "群友昵称",
      avatarVersion: "v2",
    });
    state.edit.mockResolvedValue({ updated: true });
    await act(async () =>
      state.form({ detail: { value: { nickname: "群友昵称" } } }),
    );
    expect(state.edit).toHaveBeenCalledWith("custom-board", "old", "9", 1);
    expect(state.submit).not.toHaveBeenCalled();
  },
);
it("keeps browsing and deleting existing entries available without identity fields", async () => {
  await mountBoard({
    myEntries: [
      { id: "old", value: "3", revision: 1, createdAt: "2026-10-30T08:00:00Z" },
    ],
  });
  expect(container.querySelector('button[aria-label="我的成绩记录"]')).not.toBeNull();
  expect(container.textContent).not.toContain("先设置头像和昵称");
  state.showModal.mockResolvedValue({ confirm: true });
  state.remove.mockResolvedValue({ deleted: true });
  await click("我的成绩记录");
  await click("删除");
  expect(state.remove).toHaveBeenCalledWith("custom-board", "old");
  expect(container.textContent).not.toContain("先设置头像和昵称");
});
it("allows voluntary avatar removal but requires it again for the next contribution", async () => {
  await mountBoard({
    myProfile: { userId: "me", nickname: "群友昵称", avatarVersion: "v1" },
  });
  await click("头像昵称");
  state.removeAvatar.mockResolvedValue({
    userId: "me",
    nickname: "群友昵称",
    avatarVersion: null,
  });
  await click("移除头像");
  expect(state.removeAvatar).toHaveBeenCalledTimes(1);
  await click("关闭");
  await input("填写数值", "10");
  await click("保存成绩");
  expect(state.submit).not.toHaveBeenCalled();
  expect(container.textContent).toContain("先设置头像和昵称");
});
it("submits directly when both identity fields are already set", async () => {
  await mountBoard({
    myProfile: { userId: "me", nickname: "群友昵称", avatarVersion: "v1" },
  });
  await input("填写数值", "10");
  await click("保存成绩");
  expect(state.submit).toHaveBeenCalledWith(
    "custom-board",
    "10",
    expect.any(String),
  );
  expect(container.textContent).not.toContain("先设置头像和昵称");
});

const completeProfile = {
  userId: "me",
  nickname: "我的昵称",
  avatarVersion: "v1",
};

it("confirms one model at a time, shows the note to group members, and withdraws from the management tab", async () => {
  const owned: GroupRankRecommendationRow = { id: "g502", model: "G502", rank: 1, recommenders: [completeProfile] };
  const candidate: GroupRankRecommendationRow = { id: "gpx", model: "GPX 2", rank: 1, recommenders: [
    { userId: "other", nickname: "小周", avatarVersion: null },
  ] };
  await mountBoard({
    myProfile: completeProfile,
    template: { name: "群鼠标", kind: "recommendation" },
    recommendations: { items: [owned, candidate], limit: 5 },
  });
  await click("推荐型号");
  const sheet = () => container.querySelector(".recommendation-sheet")!;
  expect(sheet().textContent).toContain("✓ 已推荐");
  expect(sheet().textContent).toContain("我的推荐 1/5");
  expect(sheet().textContent).not.toContain("撤回");
  await click("推荐 GPX 2");
  expect(state.recommend).not.toHaveBeenCalled();
  expect(sheet().textContent).toContain("我的推荐 1/5");
  await click("取消");
  expect(sheet().querySelector("textarea")).toBeNull();
  await click("推荐 GPX 2");
  await input("使用感受（选填）", "  打 FPS 跟手  ");
  state.recommend.mockRejectedValueOnce(new Error("审核暂不可用"));
  await click("确认推荐");
  expect(sheet().textContent).toContain("审核暂不可用");
  expect(sheet().querySelector("textarea")?.value).toBe("  打 FPS 跟手  ");

  const current = await state.board();
  const updated = { ...candidate, recommenders: [...candidate.recommenders, { ...completeProfile, note: "打 FPS 跟手" }] };
  state.board.mockResolvedValue({ ...current, recommendations: { items: [updated, owned], limit: 5 } });
  await click("确认推荐");
  expect(state.recommend).toHaveBeenLastCalledWith("custom-board", "GPX 2", "打 FPS 跟手");
  expect(sheet().textContent).toContain("我的推荐 2/5");
  expect(sheet().querySelector("textarea")).toBeNull();
  await click("我的推荐 2/5");
  expect(sheet().querySelector('input[placeholder="搜索或输入型号"]')).toBeNull();
  expect(sheet().querySelectorAll(".recommendation-sheet-row")).toHaveLength(2);
  state.board.mockResolvedValue({ ...current, recommendations: { items: [updated], limit: 5 } });
  await click("撤回 G502");
  expect(state.withdrawRecommendation).toHaveBeenCalledWith("custom-board", "g502");
  expect(sheet().textContent).toContain("我的推荐 1/5");
  await click("关闭");
  await click("查看 GPX 2 的推荐人");
  expect(sheet().querySelectorAll(".recommendation-person")).toHaveLength(2);
  expect(sheet().querySelector(".recommendation-person-note")?.textContent).toBe("打 FPS 跟手");
});

it("dismisses the search keyboard and lets a new model be confirmed with the note blank", async () => {
  const taro = (await import("@tarojs/taro")).default;
  const original = taro.hideKeyboard;
  const hide = vi.fn(async () => {
    state.keyboardChanged({ height: 0 });
    return { errMsg: "hideKeyboard:ok" };
  });
  taro.hideKeyboard = hide;
  try {
    state.windowInfo.mockReturnValue({ windowHeight: 667, windowWidth: 375, statusBarHeight: 20 });
    await mountBoard({
      myProfile: completeProfile,
      template: { name: "群鼠标", kind: "recommendation" },
      recommendations: { items: [], limit: 5 },
    });
    await click("推荐型号");
    const search = state.fields.get("搜索或输入型号")!;
    await act(async () => search.onFocus({ detail: { height: 300 } }));
    await input("搜索或输入型号", "有线鼠标");
    expect(container.querySelector(".profile-keyboard-open")).not.toBeNull();
    expect(hide).not.toHaveBeenCalled();

    await click("新增并推荐 有线鼠标");
    expect(hide).toHaveBeenCalledTimes(1);
    expect(container.querySelector(".profile-keyboard-open")).toBeNull();
    expect(container.querySelector(".profile-sheet-body")?.getAttribute("data-scroll-target")).toBe("recommendation-draft-new");
    expect(state.recommend).not.toHaveBeenCalled();
    expect(container.querySelector("textarea")).not.toBeNull();
    await click("确认推荐");
    expect(state.recommend).toHaveBeenCalledWith("custom-board", "有线鼠标", undefined);
  } finally {
    taro.hideKeyboard = original;
  }
});

it("retains the drafted note when the required profile sheet is dismissed or saved", async () => {
  await mountBoard({
    template: { name: "群鼠标", kind: "recommendation" },
    recommendations: { items: [], limit: 5 },
  });
  state.canIUse.mockReturnValue(false);
  await click("推荐型号");
  await input("搜索或输入型号", "有线鼠标");
  await click("新增并推荐 有线鼠标");
  await input("使用感受（选填）", "侧键好够");
  await click("确认推荐");
  expect(state.recommend).not.toHaveBeenCalled();
  expect(container.querySelector(".profile-sheet")?.textContent).toContain("保存并推荐");

  await click("关闭");
  expect(container.querySelector("textarea")?.value).toBe("侧键好够");
  await click("确认推荐");
  await act(async () => state.avatar({ detail: { avatarUrl: "wxfile://chosen" } }));
  state.saveProfile.mockResolvedValue(completeProfile);
  await act(async () => state.form({ detail: { value: { nickname: completeProfile.nickname } } }));
  expect(state.recommend).toHaveBeenCalledExactlyOnceWith("custom-board", "有线鼠标", "侧键好够");
});

const proxyPerson = {
  id: "pending-person",
  displayName: "小林",
};
const proxyRow = {
  userId: "proxy:pending-person",
  participantId: "pending-person",
  displayName: "小林",
  pendingClaim: true,
  recordedById: "owner",
  avatarVersion: null,
  score: "12",
  rank: 1,
};
async function mountProxy(
  initialId = "",
  writable = true,
  participants = [
    proxyPerson,
    { ...proxyPerson, id: "second-person", displayName: "小王" },
  ],
) {
  const changed = vi.fn(),
    close = vi.fn();
  await act(async () =>
    root.render(
      createElement(ProxySheet, {
        boardId: "board",
        participants,
        initialId,
        template: { unit: "分", min: "0", max: "999", precision: 0 } as any,
        writable,
        onClose: close,
        onChanged: changed,
      }) as any,
    ),
  );
  return { changed, close };
}
it("lets a creator without personal identity open proxy entry directly", async () => {
  await mountBoard();
  await click("帮群友记");
  expect(container.querySelector(".proxy-sheet")).not.toBeNull();
  expect(container.textContent).not.toContain("先设置头像和昵称");
  expect(container.textContent).not.toContain("保存并继续代填");
  expect(state.fields.has("nickname")).toBe(false);
  expect(state.saveProfile).not.toHaveBeenCalled();
});
it("records another person's name only through proxySubmit and preserves the creator's nickname", async () => {
  const original = {
    userId: "me",
    nickname: "创建者原昵称",
    avatarVersion: null,
  };
  await mountBoard({
    myProfile: original,
    ranking: [
      {
        userId: "me",
        displayName: "创建者原昵称",
        score: "8",
        rank: 1,
        avatarVersion: null,
      },
    ],
  });
  await click("帮群友记");
  expect(state.fields.get("群友的名字")!.type).toBe("text");
  await input("群友的名字", "老王");
  await input("填写代填成绩", "30");
  state.proxySubmit.mockResolvedValue({
    id: "proxy-entry",
    participantId: "wang",
  });
  await click("保存成绩");
  expect(state.proxySubmit).toHaveBeenCalledWith("custom-board", {
    name: "老王",
    value: "30",
    requestId: expect.any(String),
  });
  expect(state.saveProfile).not.toHaveBeenCalled();
  expect(state.submit).not.toHaveBeenCalled();
  expect(original).toEqual({
    userId: "me",
    nickname: "创建者原昵称",
    avatarVersion: null,
  });
  expect(container.textContent).toContain("创建者原昵称");
  await click("头像昵称");
  expect(state.fields.get("nickname")!.value).toBe("创建者原昵称");
});
it("cannot send a proxy name through a closed profile form's late submit event", async () => {
  await mountBoard({ myProfile: completeProfile });
  await click("头像昵称");
  const staleSubmit = state.form;
  await click("关闭");
  await click("帮群友记");
  await input("群友的名字", "老王");
  await input("填写代填成绩", "30");
  await act(async () =>
    staleSubmit({ detail: { value: { nickname: "老王" } } }),
  );
  expect(state.saveProfile).not.toHaveBeenCalled();
  state.proxySubmit.mockResolvedValue({
    id: "proxy-entry",
    participantId: "wang",
  });
  await click("保存成绩");
  expect(state.proxySubmit).toHaveBeenCalledTimes(1);
  expect(state.saveProfile).not.toHaveBeenCalled();
  await click("头像昵称");
  expect(state.fields.get("nickname")!.value).toBe("我的昵称");
});

it("validates proxy name and score, retaining them and stable retry IDs after refusal", async () => {
  await mountProxy();
  await click("保存成绩");
  expect(container.textContent).toContain("先填写群友的名字");
  await input("群友的名字", "  小林  ");
  await input("填写代填成绩", "12");
  state.proxySubmit.mockRejectedValue(new Error("名字审核失败"));
  await click("保存成绩");
  await click("保存成绩");
  expect(state.proxySubmit.mock.calls[0]).toEqual(
    state.proxySubmit.mock.calls[1],
  );
  expect(state.proxySubmit).toHaveBeenCalledWith("board", {
    name: "小林",
    value: "12",
    requestId: expect.any(String),
  });
  expect(state.fields.get("群友的名字")!.value).toBe("  小林  ");
  expect(state.fields.get("填写代填成绩")!.value).toBe("12");
  await input("填写代填成绩", "13");
  await click("保存成绩");
  expect(state.proxySubmit.mock.calls[2][1].requestId).not.toBe(
    state.proxySubmit.mock.calls[0][1].requestId,
  );
});
it("continues an existing pending participant by ID instead of creating another name", async () => {
  const { changed } = await mountProxy("pending-person");
  await input("填写代填成绩", "15");
  state.proxySubmit.mockResolvedValue({ participantId: "pending-person" });
  await click("保存成绩");
  expect(state.proxySubmit).toHaveBeenCalledWith("board", {
    participantId: "pending-person",
    value: "15",
    requestId: expect.any(String),
  });
  expect(changed).toHaveBeenCalledTimes(1);
});
it("drops stale proxy-entry history after choosing a different person", async () => {
  let finish: (rows: unknown) => void = () => {};
  state.proxyEntries.mockImplementation((_board, id) =>
    id === "pending-person"
      ? new Promise((resolve) => {
          finish = resolve;
        })
      : Promise.resolve([
          {
            id: "new",
            value: "22",
            revision: 1,
            createdAt: "2026-10-30T08:00:00Z",
          },
        ]),
  );
  await mountProxy("pending-person");
  await click("换个人");
  await act(async () => state.picker({ detail: { value: "1" } }));
  await act(async () =>
    finish([
      {
        id: "old",
        value: "777",
        revision: 1,
        createdAt: "2026-10-30T08:00:00Z",
      },
    ]),
  );
  await click("展开代填历史");
  expect(container.textContent).toContain("22 分");
  expect(container.textContent).not.toContain("777");
});
it("keeps a new multi-record proxy value while past entries are still loading", async () => {
  let finish!: (rows: GroupRankEntryDto[]) => void;
  state.proxyEntries.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  await mountProxy("pending-person");
  expect(state.fields.get("填写代填成绩")!.disabled).toBe(false);
  await input("填写代填成绩", "27");
  await act(async () => finish([]));
  expect(state.fields.get("填写代填成绩")!.value).toBe("27");
  state.proxySubmit.mockResolvedValue({ participantId: "pending-person" });
  await click("保存成绩");
  expect(state.proxySubmit).toHaveBeenCalledWith("board", expect.objectContaining({ participantId: "pending-person", value: "27" }));
});
it("supports creator proxy edit with revision and confirmed deletion", async () => {
  state.proxyEntries.mockResolvedValue([
    { id: "old", value: "12", revision: 3, createdAt: "2026-10-30T08:00:00Z" },
  ]);
  const { changed } = await mountProxy("pending-person");
  await click("展开代填历史");
  await click("修改");
  await input("填写代填成绩", "18");
  state.proxyEdit.mockResolvedValue({ updated: true });
  await click("保存修改");
  expect(state.proxyEdit).toHaveBeenCalledWith("board", "old", "18", 3);
  expect(changed).toHaveBeenCalledTimes(1);
  state.showModal.mockResolvedValueOnce({ confirm: false });
  await click("删除");
  expect(state.proxyRemove).not.toHaveBeenCalled();
  state.showModal.mockResolvedValueOnce({ confirm: true });
  state.proxyRemove.mockResolvedValue({ deleted: true });
  await click("删除");
  expect(state.proxyRemove).toHaveBeenCalledWith("board", "old");
});
it("does not apply late proxy submission after hiding or changing group context", async () => {
  const { changed } = await mountProxy();
  await input("群友的名字", "小林");
  await input("填写代填成绩", "12");
  let finish: (value: unknown) => void = () => {};
  state.proxySubmit.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await click("保存成绩");
  state.generation += 1;
  await act(async () => state.hide());
  await act(async () => finish({ participantId: "old" }));
  expect(changed).not.toHaveBeenCalled();
});
it("hides proxy maintenance from ordinary participants and requires identity to claim", async () => {
  await mountBoard({
    creatorId: "owner",
    proxyParticipants: [proxyPerson],
    ranking: [proxyRow],
  });
  expect(container.textContent).not.toContain("帮群友记");
  expect(container.querySelector(".rank-claim-chip")?.textContent).toContain("这是我");
  expect(container.querySelector(".rank-proxy-badge")?.textContent).toBe("代填");
  await click("这是我");
  expect(container.textContent).toContain("保存并继续认领");
  expect(state.claim).not.toHaveBeenCalled();
});
it("claims immediately and exposes the transferred score in my records", async () => {
  await mountBoard({
    creatorId: "owner",
    myProfile: completeProfile,
    proxyParticipants: [proxyPerson],
    ranking: [proxyRow],
  });
  const before = await state.board.mock.results[0].value;
  state.showModal.mockResolvedValue({ confirm: true });
  state.claim.mockResolvedValue({ claimed: true });
  state.board.mockResolvedValueOnce({
    ...before,
    proxyParticipants: [],
    ranking: [{ ...podiumRow("me", 1), score: "13" }],
    myEntries: [{ id: "claimed", value: "13", revision: 1, recordedById: "owner", createdAt: "2026-10-30T08:00:00Z" }],
  });
  await click("这是我");
  expect(state.showModal).toHaveBeenCalledWith(expect.objectContaining({ confirmText: "确认认领" }));
  expect(state.claim).toHaveBeenCalledWith("custom-board", "pending-person");
  expect(state.showToast).toHaveBeenCalledWith({ title: "已认领", icon: "success" });
  expect(container.querySelector(".rank-claim-chip")).toBeNull();
  await click("我的记录");
  expect(container.querySelector(".history-sheet")?.textContent).toMatch(/13.*创建者代填/);
});
it("exposes names without current-period scores so they remain claimable", async () => {
  await mountBoard({
    creatorId: "owner",
    myProfile: completeProfile,
    proxyParticipants: [proxyPerson],
    ranking: [],
  });
  expect(container.textContent).toContain("待认领名单");
  expect(container.querySelector(".proxy-names .rank-proxy-badge")?.textContent).toBe("代填");
  expect(container.textContent).toContain("这是我");
});
it("explains the single-entry rule without promising a merge", async () => {
  await mountBoard({
    creatorId: "owner",
    myProfile: completeProfile,
    proxyParticipants: [proxyPerson],
    ranking: [proxyRow],
    template: { entryMode: "single", name: "测试榜", period: "all_time" },
  });
  state.showModal.mockResolvedValue({ confirm: true });
  state.claim.mockRejectedValue(new Error("同一期只能记一笔，已有成绩与认领记录冲突。"));
  await click("这是我");
  expect(state.showModal).toHaveBeenCalledWith(expect.objectContaining({
    content: expect.stringContaining("同一期只能保留一笔"),
  }));
  expect(state.showToast).toHaveBeenCalledWith(expect.objectContaining({
    title: expect.stringContaining("认领记录冲突"),
  }));
  expect(container.querySelector(".rank-claim-chip")).not.toBeNull();
});

it("preserves recorded-by attribution on claimed entries without proxy maintenance controls", async () => {
  await mountBoard({
    creatorId: "owner",
    myProfile: completeProfile,
    proxyParticipants: [],
    myEntries: [
      {
        id: "claimed",
        value: "12",
        revision: 1,
        createdAt: "2026-10-30T08:00:00Z",
        recordedById: "owner",
      },
    ],
  });
  await click("我的成绩记录");
  expect(container.textContent).toContain("创建者代填");
  expect(container.textContent).not.toContain("帮群友记");
  expect(container.textContent).not.toContain("这是我");
});

it("continues a claim after profile completion without submitting a personal score", async () => {
  await mountBoard({
    creatorId: "owner",
    proxyParticipants: [proxyPerson],
    ranking: [proxyRow],
  });
  await input("填写数值", "88");
  await click("关闭");
  await click("这是我");
  await act(async () =>
    state.avatar({ detail: { avatarUrl: "wxfile://chosen" } }),
  );
  state.saveProfile.mockResolvedValue(completeProfile);
  state.showModal.mockResolvedValue({ confirm: true });
  state.claim.mockResolvedValue({ claimed: true });
  await act(async () =>
    state.form({ detail: { value: { nickname: "我的昵称" } } }),
  );
  expect(state.claim).toHaveBeenCalledWith("custom-board", "pending-person");
  expect(state.submit).not.toHaveBeenCalled();
});
it("does not issue a claim when the confirmation is cancelled or a new foreground replaces it", async () => {
  await mountBoard({
    creatorId: "owner",
    myProfile: completeProfile,
    proxyParticipants: [proxyPerson],
    ranking: [proxyRow],
  });
  state.showModal.mockResolvedValueOnce({ confirm: false });
  await click("这是我");
  expect(state.claim).not.toHaveBeenCalled();
  let finish: (value: unknown) => void = () => {};
  state.showModal.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await click("这是我");
  await act(async () => state.hide());
  await act(async () => finish({ confirm: true }));
  expect(state.claim).not.toHaveBeenCalled();
});
it("leaves paused proxy history readable but prevents adding and editing", async () => {
  state.proxyEntries.mockResolvedValue([
    { id: "old", value: "12", revision: 1, createdAt: "2026-10-30T08:00:00Z" },
  ]);
  await mountProxy("pending-person", false);
  await click("展开代填历史");
  expect(container.textContent).toContain("12 分");
  await click("保存成绩");
  await click("修改");
  expect(state.proxySubmit).not.toHaveBeenCalled();
  expect(state.proxyEdit).not.toHaveBeenCalled();
});

it("saves personal profile once when the native form emits duplicate submit events", async () => {
  const { saved } = await mountProfile();
  let finish: (value: unknown) => void = () => {};
  state.saveProfile.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await act(async () =>
    state.form({ detail: { value: { nickname: "本人昵称" } } }),
  );
  await act(async () =>
    state.form({ detail: { value: { nickname: "本人昵称" } } }),
  );
  expect(state.saveProfile).toHaveBeenCalledTimes(1);
  await act(async () =>
    finish({ userId: "me", nickname: "本人昵称", avatarVersion: null }),
  );
  expect(saved).toHaveBeenCalledTimes(1);
});

const podiumRow = (id: string, rank: number) => ({
  userId: id,
  displayName: `选手${id}`,
  score: "123",
  rank,
  avatarVersion: null,
});
it.each([1, 2])(
  "renders only %s real podium participants without invented people",
  async (count) => {
    const rows = Array.from({ length: count }, (_, index) =>
      podiumRow(String(index + 1), index + 1),
    );
    await act(async () =>
      root.render(createElement(Podium, { rows, unit: "分" }) as any),
    );
    expect(container.querySelectorAll(".podium-person")).toHaveLength(count);
    expect(container.querySelector(".podium-center")?.textContent).toContain(
      "选手1",
    );
    expect(container.textContent).not.toContain("选手3");
  },
);
it.each([
  { ranks: [1, 1, 3], gold: 2, silver: 0, bronze: 1 },
  { ranks: [1, 2, 2], gold: 1, silver: 2, bronze: 0 },
  { ranks: [1, 1, 1, 1], gold: 3, silver: 0, bronze: 0 },
  { ranks: [1, 4, 5], gold: 1, silver: 0, bronze: 0 },
])(
  "uses competition ranks for podium crowns: $ranks",
  async ({ ranks, gold, silver, bronze }) => {
    await act(async () =>
      root.render(
        createElement(Podium, {
          rows: ranks.map((rank, index) => podiumRow(String(index), rank)),
          unit: "分",
        }) as any,
      ),
    );
    expect(
      container.querySelectorAll(
        'img[src="/assets/championship/crown-gold.png"]',
      ),
    ).toHaveLength(gold);
    expect(
      container.querySelectorAll(
        'img[src="/assets/championship/crown-silver.png"]',
      ),
    ).toHaveLength(silver);
    expect(
      container.querySelectorAll(
        'img[src="/assets/championship/crown-bronze.png"]',
      ),
    ).toHaveLength(bronze);
    expect(container.querySelectorAll(".podium-person")).toHaveLength(
      Math.min(3, ranks.length),
    );
  },
);
it("keeps the first board view focused on real ranking with score/history/manage folded", async () => {
  await mountBoard({
    ranking: [podiumRow("me", 2), podiumRow("other", 3)],
    myEntries: [
      {
        id: "old",
        value: "17",
        revision: 1,
        createdAt: "2026-10-30T08:00:00Z",
      },
    ],
  });
  expect(container.querySelector(".score-sheet")).toBeNull();
  expect(container.querySelector(".history-panel")).toBeNull();
  expect(container.querySelector(".manage-panel")).toBeNull();
  expect(container.querySelector(".notebook-history-link")?.textContent).toContain("我的记录");
  expect(container.querySelectorAll(".rank-line")).toHaveLength(2);
  await click("记一笔");
  expect(container.querySelector(".score-sheet")).not.toBeNull();
  await click("关闭");
  await click("我的成绩记录");
  expect(container.querySelector(".history-panel")?.textContent).toContain(
    "17",
  );
});
it("does not invent a winner or own rank when there are no scores", async () => {
  await mountBoard();
  expect(container.querySelectorAll(".rank-line")).toHaveLength(0);
  expect(container.querySelector(".notebook-history-link")).toBeNull();
  expect(container.querySelector(".notebook-record")?.textContent).toBe("记第一笔");
  expect(container.querySelectorAll(".notebook-rim")).toHaveLength(0);
});

it("keeps empty score validation in the sheet and shows a paused status in the dock", async () => {
  await mountBoard();
  await click("记第一笔");
  await click("保存成绩");
  expect(container.querySelector(".score-entry .entry-error")?.textContent).toBe("先填写成绩");
  expect(state.submit).not.toHaveBeenCalled();
  await act(async () => root.render(null));
  await mountBoard({ status: "paused" });
  expect(container.querySelector(".notebook-record-state")?.textContent).toBe("已暂停提交");
  expect(container.querySelector(".notebook-record")).toBeNull();
});
it("makes additional joint leaders explicit while preserving every row in the list", async () => {
  await mountBoard({
    ranking: ["a", "b", "c", "d"].map((id) => podiumRow(id, 1)),
  });
  expect(container.querySelectorAll(".rank-line")).toHaveLength(4);
  expect([...container.querySelectorAll(".rank-number")].map(node => node.textContent)).toEqual(["01", "01", "01", "01"]);
});
it("previews a theme locally and changes the board only after a confirmed successful save", async () => {
  await mountBoard({ themeId: "volt" });
  await click("榜单外观");
  await click("像素");
  expect(container.querySelector(".board-screen")?.className).toContain(
    "theme--volt",
  );
  expect(
    container.querySelector(".appearance-sheet .appearance-editor")?.className,
  ).toContain("theme--midnight");
  expect(state.setAppearance).not.toHaveBeenCalled();
  state.setAppearance.mockRejectedValueOnce(new Error("保存失败，请重试"));
  await click("保存外观");
  expect(container.querySelector(".board-screen")?.className).toContain(
    "theme--volt",
  );
  expect(container.textContent).toContain("保存失败，请重试");
  state.setAppearance.mockResolvedValue({ themeId: "midnight" });
  await click("保存外观");
  expect(state.setAppearance).toHaveBeenCalledWith("custom-board", "midnight", null, null);
  expect(container.querySelector(".board-screen")?.className).toContain(
    "theme--midnight",
  );
  expect(container.querySelector(".appearance-sheet")).toBeNull();
});
it("lets a non-creator view the selected theme without changing it", async () => {
  await mountBoard({ creatorId: "owner", themeId: "coral" });
  await click("榜单外观");
  expect(
    container.querySelector(".appearance-sheet .theme-choices"),
  ).toBeNull();
  expect(container.textContent).not.toContain("保存外观");
  expect(state.setAppearance).not.toHaveBeenCalled();
});
it("ignores a theme-save response after leaving the board", async () => {
  await mountBoard({ themeId: "volt" });
  await click("榜单外观");
  await click("赛道");
  let finish: (value: unknown) => void = () => {};
  state.setAppearance.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await click("保存外观");
  await act(async () => state.hide());
  await act(async () => finish({ themeId: "coral" }));
  expect(container.querySelector(".board-screen")?.className).toContain(
    "theme--volt",
  );
});
it("starts with a rules summary and saves expanded scoring and appearance choices", async () => {
  await mountCreate();
  expect(container.querySelector(".rules-content")).toBeNull();
  await click("展开计分规则");
  expect(container.querySelector(".theme-choices")).toBeNull();
  expect(container.querySelector(".theme-preview")).toBeNull();
  expect(container.querySelector(".create-editor .definition-fields")).not.toBeNull();
  await input("榜单名称", "周末积分");
  await input("选填", "分");
  expect(container.querySelector(".invite-preview")).toBeNull();
  expect(state.fields.get("榜单名称")!.value).toBe("周末积分");
  expect(state.fields.get("选填")!.value).toBe("分");
  await click("累计");
  await click("每月重新开始");
  await click("榜单外观");
  await click("赛道");
  await click("使用此外观");
  await click("保存并继续");
  expect(state.createDraft).toHaveBeenCalledWith(
    expect.objectContaining({
      themeId: "coral",
      name: "周末积分",
      unit: "分",
      aggregate: "sum",
      period: "month",
    }),
    expect.any(String),
  );
});

it("restores light native capsule ink after the pushed creation page becomes ready", async () => {
  await mountCreate();
  state.setNavigationBarColor.mockClear();
  await act(async () => state.ready());
  expect(state.setNavigationBarColor).toHaveBeenLastCalledWith({frontColor:"#ffffff",backgroundColor:"#11171b"});
});
it("synchronizes native navigation chrome with the actual board and create themes", async () => {
  await mountBoard({ themeId: "midnight" });
  expect(state.setNavigationBarColor).toHaveBeenLastCalledWith({
    frontColor: "#ffffff",
    backgroundColor: "#11171b",
  });
  await act(async () => root.render(null));
  await mountCreate();
  await click("榜单外观");
  await click("赛道");
  await click("使用此外观");
  expect(state.setNavigationBarColor).toHaveBeenLastCalledWith({
    frontColor: "#ffffff",
    backgroundColor: "#11171b",
  });
});
it("retains every digit and full long name in podium contents", async () => {
  const name = "这是一位拥有很长很长名字的真实参与者用来验证排版";
  const rows = [1, 2, 3].map((rank) => ({
    ...podiumRow(String(rank), rank),
    displayName: name,
    score: "999999999.999",
  }));
  await act(async () =>
    root.render(createElement(Podium, { rows, unit: "分" }) as any),
  );
  for (const person of container.querySelectorAll(".podium-person")) {
    expect(person.textContent).toContain(name);
    expect(person.textContent).toContain("999999999.999");
  }
});

it("keeps an unsent score draft when closing its sheet but does not turn a cancelled edit into a new entry", async () => {
  await mountBoard({
    myProfile: completeProfile,
    myEntries: [
      {
        id: "old",
        value: "17",
        revision: 1,
        createdAt: "2026-10-30T08:00:00Z",
      },
    ],
  });
  await input("填写数值", "28");
  await click("关闭");
  await click("记一笔");
  expect(state.fields.get("填写数值")!.value).toBe("28");
  await click("关闭");
  await click("我的成绩记录");
  const edit = [...container.querySelectorAll("button")].find(
    (button) => button.textContent === "修改",
  );
  await act(async () => edit!.click());
  await input("填写数值", "19");
  await click("关闭");
  expect(container.querySelector(".history-sheet")).not.toBeNull();
  await click("关闭");
  await click("记一笔");
  expect(state.fields.get("填写数值")!.value).toBe("");
  expect(state.submit).not.toHaveBeenCalled();
  expect(state.edit).not.toHaveBeenCalled();
});

it.each(["podium", "standing", "row", "card"] as const)(
  "keeps a long %s score in one unbroken numeric node with a separate unit",
  async (layout) => {
    const value = "999999998.999";
    await act(async () =>
      root.render(
        createElement(ScoreValue, { value, unit: "分", layout }) as any,
      ),
    );
    const number = container.querySelector(".score-number") as HTMLElement;
    expect(number.textContent).toBe(value);
    expect(number.style.whiteSpace).toBe("nowrap");
    expect(number.children).toHaveLength(0);
    expect(container.querySelector(".score-value")?.className).toContain(
      "score-compact",
    );
    expect(container.querySelector(".score-value-unit")?.textContent).toBe(
      "分",
    );
    expect(number.contains(container.querySelector(".score-value-unit"))).toBe(
      false,
    );
  },
);
it.each([
  ["128.5", "128.5"],
  ["668.000", "668"],
])("preserves prominent numbers for %s", async (value, expected) => {
  await act(async () =>
    root.render(
      createElement(ScoreValue, {
        value,
        unit: "分",
        layout: "podium",
      }) as any,
    ),
  );
  expect(container.querySelector(".score-value")?.className).not.toContain(
    "score-compact",
  );
  expect(container.querySelector(".score-number")?.textContent).toBe(expected);
});
it("renders an intact long score in leading and regular ranking rows", async () => {
  const value = "999999998.999";
  await mountBoard({
    ranking: [
      { ...podiumRow("me", 1), score: value },
      podiumRow("second", 2),
      podiumRow("third", 3),
      { ...podiumRow("fourth", 4), score: value },
    ],
  });
  for (const selector of [".rank-lead .rank-score", ".rank-line:last-child .rank-score"]) {
    expect(container.querySelector(selector)?.textContent).toBe(value);
  }
  expect(container.querySelectorAll(".rank-line-long")).toHaveLength(2);
});

it("keeps the three featured identities in server order without duplicating them below", async () => {
  await mountBoard({
    ranking: [1, 2, 3, 4].map((rank) => podiumRow(String(rank), rank)),
  });
  expect(
    [...container.querySelectorAll(".rank-person-name")].map(
      (node) => node.textContent,
    ),
  ).toEqual(["选手1", "选手2", "选手3", "选手4"]);
  expect(container.querySelector(".board-header .title")).toBeNull();
  expect(container.querySelector(".notebook-dock")?.textContent).not.toContain(
    "分享",
  );
});

it("starts with the actual board identity and keeps explanations behind Rules", async () => {
  await mountBoard({ ranking: [podiumRow("a", 1), podiumRow("b", 2)] });
  expect(container.querySelector(".board-name")?.textContent).toBe("读书页数");
  expect(
    container.querySelector(".rank-cover .board-name")?.textContent,
  ).toBe("读书页数");
  expect(
    container.querySelector(".page-frame-header")?.textContent,
  ).toContain("读书页数");
  expect(container.querySelector(".street-hero")).toBeNull();
  expect(container.textContent).not.toContain("同一个群");
  expect(container.textContent).not.toContain("同分并列");
  expect(container.querySelector(".board-rules-detail")).toBeNull();
  const badges = container.querySelectorAll(".rank-avatar");
  expect(badges).toHaveLength(2);
  expect(badges[0].querySelector(".person-avatar")).not.toBeNull();
  expect([...container.querySelectorAll(".rank-number")].map(n=>n.textContent)).toEqual(["01","02"]);
  expect(container.querySelector(".notebook-rim")).toBeNull();
  await click("规则");
  expect(container.querySelector(".rules-sheet")?.textContent).toContain(
    "同分并列",
  );
});

it("keeps the current real name when title rendering fails and drops late old-board artwork", async () => {
  let finish!: (value: any) => void;
  state.titleArt.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await act(async () =>
    root.render(
      createElement(TitleArtwork, { boardId: "old", name: "尿酸王" }) as any,
    ),
  );
  expect(container.textContent).toContain("尿酸王");
  await act(async () =>
    root.render(
      createElement(TitleArtwork, { boardId: "new", name: "夜跑冠军" }) as any,
    ),
  );
  await act(async () =>
    finish({
      name: "尿酸王",
      version: "electric-edge-v4",
      imageDataUri: "data:image/png;base64,old",
      width: 1024,
      height: 360,
    }),
  );
  expect(container.textContent).toContain("夜跑冠军");
  expect(container.querySelector(".title-artwork-image")).toBeNull();
  expect(container.textContent).not.toContain("尿酸王");
});

it("uses only matching PNG title artwork and clears an image that fails to load", async () => {
  state.titleArt.mockResolvedValue({
    name: "尿酸王",
    version: "electric-edge-v4",
    imageDataUri: "data:image/png;base64,safe",
    width: 1024,
    height: 360,
  });
  await act(async () =>
    root.render(
      createElement(TitleArtwork, { boardId: "board", name: "尿酸王" }) as any,
    ),
  );
  expect(
    container.querySelector(".title-artwork-image")?.getAttribute("src"),
  ).toBe("data:image/png;base64,safe");
  await act(async () =>
    container
      .querySelector(".title-artwork-image")!
      .dispatchEvent(new Event("error")),
  );
  expect(container.querySelector(".title-artwork-image")).toBeNull();
  expect(container.querySelector(".title-artwork-fallback")?.textContent).toBe(
    "尿酸王",
  );
});

it("rejects an obsolete title style even when its name and PNG match", async () => {
  state.titleArt.mockResolvedValue({
    name: "尿酸王",
    version: "enamel-v1",
    imageDataUri: "data:image/png;base64,obsolete",
    width: 1024,
    height: 366,
  });
  await act(async () =>
    root.render(createElement(TitleArtwork, { boardId: "board", name: "尿酸王" }) as any),
  );
  expect(container.querySelector(".title-artwork-image")).toBeNull();
  expect(container.querySelector(".title-artwork-fallback")?.textContent).toBe("尿酸王");
});

it("starts proxy entry with direct name and value fields when no participant is available", async () => {
  await mountProxy("", true, []);
  expect(container.querySelector("[data-picker-options]")).toBeNull();
  expect(
    container.querySelector('input[placeholder="群友的名字"]'),
  ).not.toBeNull();
  expect(
    container.querySelector('input[placeholder="填写代填成绩"]'),
  ).not.toBeNull();
  expect(container.textContent).toContain("记给谁");
  expect(container.textContent).not.toContain("新增一个名字");
});
it("offers a direct continuation for one participant and clears the score when changing person", async () => {
  await mountProxy("", true, [proxyPerson]);
  expect(container.querySelector("[data-picker-options]")).toBeNull();
  await input("群友的名字", "尚未登记的名字");
  await click("继续给小林记");
  expect(container.querySelector(".entry-person")?.textContent).toContain(
    "小林",
  );
  expect(container.querySelector('input[placeholder="群友的名字"]')).toBeNull();
  await input("填写代填成绩", "15");
  await click("换个人");
  expect(
    container.querySelector('input[placeholder="群友的名字"]'),
  ).not.toBeNull();
  expect(state.fields.get("填写代填成绩")!.value).toBe("");
  expect(state.fields.get("群友的名字")!.value).toBe("");
  expect(state.proxySubmit).not.toHaveBeenCalled();
  expect(state.saveProfile).not.toHaveBeenCalled();
});
it("uses a selector only for several existing names and maps zero to the first real participant", async () => {
  await mountProxy();
  expect(
    JSON.parse(
      container
        .querySelector("[data-picker-options]")!
        .getAttribute("data-picker-options")!,
    ),
  ).toEqual(["小林", "小王"]);
  await act(async () => state.picker({ detail: { value: "0" } }));
  expect(container.querySelector(".entry-person")?.textContent).toContain(
    "小林",
  );
  await input("填写代填成绩", "16");
  state.proxySubmit.mockResolvedValue({ participantId: "pending-person" });
  await click("保存成绩");
  expect(state.proxySubmit).toHaveBeenCalledWith("board", {
    participantId: "pending-person",
    value: "16",
    requestId: expect.any(String),
  });
});

it("cancels an old participant's pending deletion confirmation after changing person", async () => {
  state.proxyEntries.mockResolvedValue([
    {
      id: "old-entry",
      value: "12",
      revision: 1,
      createdAt: "2026-10-30T08:00:00Z",
    },
  ]);
  let confirm: (value: { confirm: boolean }) => void = () => {};
  state.showModal.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        confirm = resolve;
      }),
  );
  await mountProxy("pending-person");
  await click("展开代填历史");
  await click("删除");
  await click("换个人");
  await act(async () => state.picker({ detail: { value: "1" } }));
  await act(async () => confirm({ confirm: true }));
  expect(container.querySelector(".entry-person-name")?.textContent).toBe(
    "小王",
  );
  expect(state.proxyRemove).not.toHaveBeenCalled();
});
it("drops edit intent and values when changing the participant before recording a new score", async () => {
  state.proxyEntries.mockResolvedValue([
    {
      id: "old-entry",
      value: "12",
      revision: 3,
      createdAt: "2026-10-30T08:00:00Z",
    },
  ]);
  await mountProxy("pending-person");
  await click("展开代填历史");
  await click("修改");
  await input("填写代填成绩", "99");
  await click("换个人");
  expect(state.fields.get("填写代填成绩")!.value).toBe("");
  expect(container.textContent).not.toContain("取消修改");
  await act(async () => state.picker({ detail: { value: "1" } }));
  await input("填写代填成绩", "18");
  state.proxySubmit.mockResolvedValue({ participantId: "second-person" });
  await click("保存成绩");
  expect(state.proxyEdit).not.toHaveBeenCalled();
  expect(state.proxySubmit).toHaveBeenCalledWith("board", {
    participantId: "second-person",
    value: "18",
    requestId: expect.any(String),
  });
  expect(state.saveProfile).not.toHaveBeenCalled();
});

it("keeps history reachable after the ranking without repeating the score", async () => {
  await mountBoard({ ranking: [podiumRow("first", 1), podiumRow("second", 2), podiumRow("me", 3), podiumRow("fourth", 4)], myEntries: [{ id: "own", value: "14", revision: 1, createdAt: "2026-10-30T08:00:00Z" }] });
  const mine = container.querySelector(".notebook-history-link")!;
  expect(mine.closest(".notebook-own")).not.toBeNull();
  expect(mine.textContent).toBe("我的记录›");
  expect(container.querySelector(".notebook-dock .notebook-record")).not.toBeNull();
  await act(async () => (mine as HTMLButtonElement).click());
  expect(container.querySelector(".history-panel")).not.toBeNull();
});

it("keeps Create and Board usable in hosts without native window or capsule APIs", async () => {
  await mountCreate();
  expect(
    container
      .querySelector<HTMLElement>(".page-frame")!
      .style.getPropertyValue("--page-status-height"),
  ).toBe("0px");
  expect(container.querySelector(".page-frame-header")?.textContent).toContain(
    "新建榜单",
  );
  await mountBoard();
  expect(
    container
      .querySelector<HTMLElement>(".page-frame")!
      .style.getPropertyValue("--page-capsule-clearance"),
  ).toBe("0px");
});


it.each([[1,1,3],[1,2,2],[1,4,5]])("uses actual competition ranks in the compact stage: %j",async (...ranks)=>{
  await mountBoard({ranking:ranks.map((rank,i)=>podiumRow(String(i),rank as number))});
  expect([...container.querySelectorAll(".rank-number")].map(n=>Number(n.textContent))).toEqual(ranks);
});



it.each([0, 1, 2, 3, 4])("shows the exact row count and empty state for %i participants", async count => {
  await mountBoard({ranking:Array.from({length:count},(_,i)=>podiumRow(`person-${i}`,i+1))});
  expect(container.textContent).not.toContain("全部成绩");
  expect(container.querySelector(".rank-empty")!==null).toBe(count===0);
  expect(container.querySelectorAll(".rank-line")).toHaveLength(count);
});
it("keeps the actual board name in the fixed header while scrolling the ranking",async()=>{
  await mountBoard({ranking:[1,2,3,4].map(i=>podiumRow(String(i),i))});
  await act(async()=>state.scroll({scrollTop:1000}));
  expect(container.querySelector(".page-frame-header .page-frame-title")?.textContent).toBe("读书页数");
});
it("locks page scrolling for score, management and theme sheets and releases it on close",async()=>{
  await mountBoard({ranking:[podiumRow("me",1)]});
  const locked=()=>container.querySelector("meta[data-page-style]")?.getAttribute("data-page-style");
  for(const name of ["记一笔","更多","榜单外观"]){
    await click(name);expect(locked()).toContain("overflow:hidden;");
    expect(container.querySelectorAll(".profile-mask")).toHaveLength(1);
    expect(container.querySelector(".profile-backdrop")?.getAttribute("data-catch-move")).toBe("true");
    await click("关闭");expect(locked()).toBe("");
  }
  await click("头像昵称");
  expect(container.querySelectorAll(".profile-mask")).toHaveLength(1);
  expect(container.querySelector(".manage-panel")).toBeNull();
  expect(locked()).toContain("overflow:hidden;");
  await click("关闭");expect(locked()).toBe("");
});

it("opens an explicit proxy-management action above the page with scrolling locked",async()=>{
  await mountBoard({proxyParticipants:[proxyPerson],ranking:[proxyRow],myProfile:completeProfile});
  expect(container.querySelector(".rank-person-action")?.textContent).toBe("查看记录 ›");
  await click("查看记录");
  expect(container.querySelector(".proxy-sheet")?.textContent).toContain("小林");
  expect(container.querySelector(".proxy-sheet .section-title")?.textContent).toBe("代填记录");
  expect(container.querySelectorAll(".profile-mask")).toHaveLength(1);
  expect(container.querySelector("meta[data-page-style]")?.getAttribute("data-page-style")).toContain("overflow:hidden;");
  await click("关闭");
  expect(container.querySelector("meta[data-page-style]")?.getAttribute("data-page-style")).toBe("");
});

it("freezes the original offset while a sheet is open and restores it only on close",async()=>{
  await mountBoard({ranking:[1,2,3,4].map(i=>podiumRow(String(i),i))});
  await act(async()=>state.scroll({scrollTop:130}));
  await click("记一笔");
  expect(container.querySelector("meta[data-page-style]")?.getAttribute("data-page-style")).toBe("overflow:hidden;");
  expect((container.querySelector(".page-frame-locked") as HTMLElement).style.top).toBe("-130px");
  await act(async()=>state.scroll({scrollTop:0}));
  expect((container.querySelector(".page-frame-locked") as HTMLElement).style.top).toBe("-130px");
  await click("关闭");
  expect(container.querySelector("meta[data-page-style]")?.getAttribute("data-scroll-top")).toBe("130px");
  expect(state.pageScrollTo).not.toHaveBeenCalled();
});


it("keeps shared sheet header and save outside the scrolling body while fitting an overlay keyboard", async () => {
  state.windowInfo.mockReturnValue({ windowHeight: 844, windowWidth: 390, statusBarHeight: 44 });
  await mountBoard({ ranking: [podiumRow("me", 1)] });
  await click("记一笔");
  const field = state.fields.get("填写数值") || [...state.fields.values()].find(item => item.type === "digit");
  expect(field?.adjustPosition).toBe(false);
  expect(field?.holdKeyboard).toBe(true);
  expect(container.querySelector(".profile-heading")?.closest(".profile-sheet")?.classList.contains("profile-sheet")).toBe(true);
  expect(container.querySelector(".profile-sheet-footer .action")?.textContent).toBe("保存成绩");
  await act(async () => field!.onFocus({ detail: { height: 320 } }));
  expect((container.querySelector(".profile-mask") as HTMLElement).style.height).toBe("524px");
  expect(container.querySelector(".profile-mask")?.classList.contains("profile-keyboard-open")).toBe(true);
  // An Android host can shrink the window by the same 320px: no second subtraction.
  state.windowInfo.mockReturnValue({ windowHeight: 524, windowWidth: 390, statusBarHeight: 44 });
  await act(async () => state.windowResized({ size: { windowHeight: 524, windowWidth: 390 } }));
  expect((container.querySelector(".profile-mask") as HTMLElement).style.height).toBe("524px");
  await act(async () => state.keyboardChanged({ height: 0 }));
  await act(async () => state.windowResized({ size: { windowHeight: 844, windowWidth: 390 } }));
  expect((container.querySelector(".profile-mask") as HTMLElement).style.height).toBe("844px");
  await click("关闭");
  expect(state.offKeyboard).toHaveBeenCalled();
  expect(state.offResize).toHaveBeenCalled();
});

it("keeps proxy save reachable outside long history and preserves draft during keyboard changes", async () => {
  state.windowInfo.mockReturnValue({ windowHeight: 812, windowWidth: 375, statusBarHeight: 44 });
  await mountBoard({ ranking: [podiumRow("me", 1)] });
  await click("帮群友记");
  const name = state.fields.get("群友的名字")!;
  const value = state.fields.get("填写代填成绩")!;
  await act(async () => { name.onInput({ detail: { value: "群友甲" } }); value.onInput({ detail: { value: "123.4" } }); });
  await act(async () => state.keyboardChanged({ height: 360 }));
  await act(async () => state.fields.get("填写代填成绩")!.onFocus({ detail: { height: 0 } }));
  expect((container.querySelector(".profile-mask") as HTMLElement).style.height).toBe("452px");
  expect(container.querySelector(".profile-sheet-footer .action")?.textContent).toBe("保存成绩");
  expect(container.querySelector(".profile-sheet-body .action")).toBeNull();
  expect(state.fields.get("群友的名字")?.value).toBe("群友甲");
  expect(state.fields.get("填写代填成绩")?.value).toBe("123.4");
});

it("keeps the board and artwork mounted while a confirmed score waits for refreshed ranks", async () => {
  await mountBoard({myProfile:completeProfile,ranking:[podiumRow("me",1)]});
  const initial = await state.board.mock.results[0].value;
  const portrait = container.querySelector(".rank-line");
  const artwork = container.querySelector(".title-artwork");
  const artReads = state.titleArt.mock.calls.length;
  let finish!: (detail: typeof initial) => void;
  state.board.mockReturnValueOnce(new Promise(resolve => { finish = resolve; }));
  await input("填写数值", "245");
  await click("保存成绩");
  expect(container.querySelector(".rank-line")).toBe(portrait);
  expect(container.querySelector(".title-artwork")).toBe(artwork);
  expect(container.querySelector(".board-loading")).toBeNull();
  expect(container.querySelector(".score-sheet button.action")?.hasAttribute("disabled")).toBe(true);
  await act(async () => finish({...initial,ranking:[{...initial.ranking[0],score:"245"}]}));
  expect(container.querySelector(".score-sheet")).toBeNull();
  expect(container.querySelector(".title-artwork")).toBe(artwork);
  expect(state.titleArt).toHaveBeenCalledTimes(artReads);
  expect(state.showToast).toHaveBeenCalledWith(expect.objectContaining({title:"记下了"}));
  expect(state.offerReturnHelp).not.toHaveBeenCalled();
});

it("does not repeatedly scroll the focused sheet field when the keyboard reports the same height", async () => {
  state.windowInfo.mockReturnValue({windowHeight:812,windowWidth:375,statusBarHeight:44});
  await mountBoard({myProfile:completeProfile});
  await click("记一笔");
  const field = [...state.fields.values()].find(item=>item.type==="digit")!;
  await act(async()=>field.onFocus({detail:{height:320}}));
  const ticks=state.nextTick.mock.calls.length;
  await act(async()=>{state.keyboardChanged({height:320});state.keyboardChanged({height:320});});
  expect(state.nextTick).toHaveBeenCalledTimes(ticks);
});


it("returns from an edit to the same history position without unlocking the background", async () => {
  await mountBoard({myProfile:completeProfile,myEntries:[{id:"old",value:"17",revision:1,createdAt:"2026-10-30T08:00:00Z"}]});
  await click("我的成绩记录");
  await act(async()=>state.sheetScrolled({detail:{scrollTop:180}}));
  await click("修改");
  expect(container.querySelectorAll(".profile-mask")).toHaveLength(1);
  await click("关闭");
  expect(container.querySelector(".history-sheet .profile-sheet-body")?.getAttribute("data-scroll-top")).toBe("180");
  expect(state.pageScrollTo).not.toHaveBeenCalled();
  await click("关闭");
  expect(container.querySelector("meta[data-page-style]")?.getAttribute("data-scroll-top")).toBe("0px");
});

it("clears private ranking when the refresh after a write fails instead of showing it as current", async () => {
  await mountBoard({myProfile:completeProfile,ranking:[podiumRow("me",1)]});
  state.board.mockRejectedValueOnce(new Error("无法核验当前榜单"));
  await input("填写数值","123"); await click("保存成绩");
  expect(container.querySelector(".rank-line")).toBeNull();
  expect(container.querySelector(".board-error")?.textContent).toContain("无法核验当前榜单");
  expect(state.submit).toHaveBeenCalledTimes(1);
});

it("leaves ranking rows and footer in place through vertical scrolling", async () => {
  await mountBoard({ ranking: [1,2,3,4].map(i => podiumRow(String(i),i)) });
  const rows = [...container.querySelectorAll(".rank-line")];
  const footer = container.querySelector(".notebook-dock");
  for (const top of [12, 56, 163, 0]) {
    await act(async () => state.scroll({scrollTop:top}));
    expect([...container.querySelectorAll(".rank-line")]).toEqual(rows);
    expect(container.querySelector(".notebook-dock")).toBe(footer);
    expect(container.querySelector(".page-frame-title")?.textContent).toBe("读书页数");
  }
});

it("restores the empty cover and rules when deleting the last ranked score from a scrolled board", async () => {
  await mountBoard({ ranking:[podiumRow("me",1)], myEntries:[{id:"last",value:"17",revision:1,createdAt:"2026-10-30T08:00:00Z"}] });
  const current = await state.board.mock.results[0].value;
  await act(async () => state.scroll({scrollTop:500}));
  await click("我的成绩记录");
  state.board.mockResolvedValue({...current,ranking:[],myEntries:[]});
  state.showModal.mockResolvedValueOnce({confirm:true});
  await click("删除");
  expect(container.querySelector(".rank-empty")).not.toBeNull();
  expect(container.querySelector(".rank-cover-action")).not.toBeNull();
});

it("keeps proxy maintenance reachable on a rank row after the featured three", async () => {
  await mountBoard({
    ranking: [podiumRow("a", 1), podiumRow("b", 2), podiumRow("c", 3), {...proxyRow, rank: 4}],
    proxyParticipants: [proxyPerson],
  });
  const row = container.querySelector("button.rank-line");
  expect(row?.textContent).toContain("04");
  expect(row?.textContent).toContain("查看记录");
  expect(row?.querySelector("button")).toBeNull();
  await act(async () => (row as HTMLButtonElement).click());
  expect(container.querySelector(".proxy-sheet")?.textContent).toContain("小林");
  expect(container.querySelector("meta[data-page-style]")?.getAttribute("data-page-style")).toContain("overflow:hidden");
});

it("dismisses a held native keyboard when its sheet is closed", async () => {
  const taro = (await import("@tarojs/taro")).default;
  const original = taro.hideKeyboard;
  const hide = vi.fn(async () => ({errMsg:"hideKeyboard:ok"}));
  taro.hideKeyboard = hide;
  try {
    state.windowInfo.mockReturnValue({windowHeight:568,windowWidth:320,statusBarHeight:20});
    await mountBoard({myProfile:completeProfile});
    await click("记一笔");
    const field = [...state.fields.values()].find(item => item.type === "digit")!;
    expect(field.holdKeyboard).toBe(true);
    await act(async () => field.onFocus({detail:{height:320}}));
    await click("关闭");
    expect(container.querySelector(".profile-mask")).toBeNull();
    expect(hide).toHaveBeenCalledTimes(1);
  } finally { taro.hideKeyboard = original; }
});


it("keeps the create action above an overlay keyboard and does not double-inset a resized Android window", async () => {
  state.windowInfo.mockReturnValue({ windowHeight: 844, windowWidth: 390, statusBarHeight: 44 });
  await mountCreate();
  await input("榜单名称", "验收临时榜");
  await act(async () => state.keyboardChanged({ height: 320 }));
  const frame = () => container.querySelector(".create-screen") as HTMLElement;
  const page = () => container.querySelector(".create-page") as HTMLElement;
  expect(page().style.getPropertyValue("--create-keyboard-inset")).toBe("320px");
  expect(frame().classList.contains("create-keyboard-open")).toBe(true);
  state.windowInfo.mockReturnValue({ windowHeight: 524, windowWidth: 390, statusBarHeight: 44 });
  await act(async () => state.windowResized({ size: { windowHeight: 524, windowWidth: 390 } }));
  expect(page().style.getPropertyValue("--create-keyboard-inset")).toBe("0px");
  await act(async () => state.keyboardChanged({ height: 0 }));
  state.windowInfo.mockReturnValue({ windowHeight: 844, windowWidth: 390, statusBarHeight: 44 });
  await act(async () => state.windowResized({ size: { windowHeight: 844, windowWidth: 390 } }));
  expect(frame().classList.contains("create-keyboard-open")).toBe(false);
  expect(page().style.getPropertyValue("--create-keyboard-inset")).toBe("0px");
  expect(container.querySelector('input[placeholder="榜单名称"]')?.getAttribute("value")).toBe("验收临时榜");
});

it("holds the create keyboard until save is invoked, then dismisses it and saves once", async () => {
  const taro = (await import("@tarojs/taro")).default;
  const original = taro.hideKeyboard;
  const hide = vi.fn(async () => ({errMsg:"hideKeyboard:ok"}));
  taro.hideKeyboard = hide;
  try {
    await mountCreate();
    await input("榜单名称", "验收临时榜");
    expect(state.fields.get("榜单名称")?.holdKeyboard).toBe(true);
    await act(async () => state.keyboardChanged({height:280}));
    await click("保存并继续");
    expect(hide).toHaveBeenCalledTimes(1);
    expect(state.createDraft).toHaveBeenCalledTimes(1);
    expect(container.querySelector(".create-screen")?.classList.contains("create-keyboard-open")).toBe(false);
    expect(container.textContent).toContain("发到微信群");
  } finally {taro.hideKeyboard = original;}
});

it("keeps the resting sheet height when a stale native measurement returns while the keyboard is open", async () => {
  const taro = (await import("@tarojs/taro")).default as unknown as { createSelectorQuery?: unknown };
  const callbacks: ((boxes: { height: number }[]) => void)[] = [];
  taro.createSelectorQuery = () => {
    const query = { select: () => query, boundingClientRect: () => query, exec: (callback: typeof callbacks[number]) => callbacks.push(callback) };
    return query;
  };
  try {
    state.windowInfo.mockReturnValue({ windowHeight: 844, windowWidth: 390, statusBarHeight: 44 });
    await mountBoard({ ranking: [podiumRow("me", 1)] });
    await click("记一笔");
    expect(callbacks.length).toBeGreaterThan(0);
    await act(async () => callbacks.shift()!([{ height: 72 }, { height: 200 }, { height: 100 }]));
    const resting = () => (container.querySelector(".profile-mask") as HTMLElement).style.getPropertyValue("--sheet-height");
    expect(resting()).toBe("373px");
    const stale = callbacks.shift()!;
    expect(stale).toBeTypeOf("function");
    const field = [...state.fields.values()].find(item => item.type === "digit")!;
    await act(async () => field.onFocus({ detail: { height: 320 } }));
    await act(async () => stale([{ height: 56 }, { height: 120 }, { height: 56 }]));
    await act(async () => state.keyboardChanged({ height: 0 }));
    // The first keyboard-closed render uses the measured resting surface, not compact keyboard content.
    expect(resting()).toBe("373px");
  } finally {
    delete taro.createSelectorQuery;
  }
});

it("shows a pending creation action, retains input after failure and retries exactly the same write", async () => {
  await mountCreate();
  await input("榜单名称","慢网积分");
  let reject!: (reason:Error) => void;
  state.createDraft.mockImplementationOnce(() => new Promise((_resolve, fail) => { reject = fail; }));
  await click("保存并继续");
  expect(container.querySelector(".action-pending")?.textContent).toBe("正在保存规则…");
  await click("正在保存规则…");
  expect(state.createDraft).toHaveBeenCalledTimes(1);
  await act(async () => reject(new Error("网络中断")));
  expect(container.querySelector(".action-pending")).toBeNull();
  expect(state.fields.get("榜单名称")?.value).toBe("慢网积分");
  expect(container.textContent).toContain("网络中断");
  await click("保存并继续");
  expect(state.createDraft.mock.calls[1][1]).toBe(state.createDraft.mock.calls[0][1]);
});
it("keeps board colors unchanged until successful persistence and carries them into root portals", async () => {
  await mountBoard({accentColor:"#39C5BB",myProfile:completeProfile});
  await click("榜单外观");
  await click("玫红配色");
  const frame = () => container.querySelector(".board-screen") as HTMLElement;
  expect(frame().style.getPropertyValue("--accent")).toBe("#39C5BB");
  let finish!: (value:any) => void;
  state.setAppearance.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  await click("保存外观");
  expect(container.querySelector(".action-pending")?.textContent).toBe("正在保存外观…");
  await act(async () => finish({themeId:"volt",accentColor:"#F65D9B",background:null}));
  expect(frame().style.getPropertyValue("--accent")).toBe("#F65D9B");
  await click("记一笔");
  expect((container.querySelector(".profile-mask") as HTMLElement).style.getPropertyValue("--accent")).toBe("#F65D9B");
});
it("keeps the score sheet and ranking mounted while a successful write refreshes", async () => {
  await mountBoard({myProfile:completeProfile,ranking:[podiumRow("me",1)]});
  await input("填写数值","17");
  const initial = await state.board.mock.results[0].value;
  let finish!: (board:any) => void;
  state.board.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  await click("保存成绩");
  expect(container.querySelector(".action-pending")?.textContent).toBe("保存中…");
  expect(container.querySelector(".rank-line")).not.toBeNull();
  expect(container.querySelector(".page-skeleton")).toBeNull();
  await act(async () => finish(initial));
  expect(container.querySelector(".action-pending")).toBeNull();
});

it("keeps score failures above the keyboard and retries the same request with the entered value", async () => {
  await mountBoard({myProfile:completeProfile,ranking:[podiumRow("me",1)]});
  await input("填写数值","398");
  state.submit.mockRejectedValueOnce(new Error("网络中断，请重试"));
  await click("保存成绩");
  expect(container.querySelector(".score-sheet .score-entry .entry-error")?.textContent).toBe("网络中断，请重试");
  expect(state.fields.get("填写数值")?.value).toBe("398");
  expect(container.querySelector(".score-sheet")).not.toBeNull();
  await click("保存成绩");
  expect(state.submit.mock.calls[1]).toEqual(state.submit.mock.calls[0]);
  expect(container.querySelector(".score-sheet")).toBeNull();
});

it("leaves tall identities in natural flow so a narrow viewport can reach the remaining ranking", async () => {
  await mountBoard({ranking:[1,2,3,4].map(i=>({...podiumRow(String(i),i),displayName:"超长群友名称用于检查完整姓名的显示效果"}))});
  const rows = [...container.querySelectorAll(".rank-person-name")];
  expect(rows).toHaveLength(4);
  expect(rows.every(row => row.textContent === "超长群友名称用于检查完整姓名的显示效果")).toBe(true);
});

it("reveals a clipped focused score again when a keyboard footer grows, without replacing resting measurements", async () => {
  const taro=(await import("@tarojs/taro")).default as unknown as {createSelectorQuery?:unknown};
  const reads:{ids:string[];callback:(boxes:any[])=>void}[]=[];
  taro.createSelectorQuery=()=>{
    const ids:string[]=[];
    const q={select:(id:string)=>{ids.push(id);return q;},boundingClientRect:()=>q,exec:(callback:(boxes:any[])=>void)=>reads.push({ids,callback})};
    return q;
  };
  try {
    state.windowInfo.mockReturnValue({windowHeight:568,windowWidth:320,statusBarHeight:44});
    await mountBoard({myProfile:completeProfile,ranking:[podiumRow("me",1)]});
    await input("填写数值","398");
    await act(async()=>state.fields.get("填写数值")!.onFocus({detail:{height:300}}));
    const resting=()=> (container.querySelector(".profile-mask") as HTMLElement).style.getPropertyValue("--sheet-height");
    const previous=resting();
    state.submit.mockRejectedValueOnce(new Error("网络中断，请重试"));
    await click("保存成绩");
    const read=reads.filter(r=>r.ids[0]?.endsWith("-body")).at(-1)!;
    expect(read.ids[1]).toMatch(/^#sheet-field-/);
    const ticks=state.nextTick.mock.calls.length;
    await act(async()=>read.callback([{top:109,bottom:185},{top:156,bottom:196}]));
    expect(state.nextTick.mock.calls.length).toBeGreaterThan(ticks);
    expect(container.querySelector(".profile-sheet-body")?.getAttribute("data-scroll-target")).toBe(read.ids[1].slice(1));
    expect(resting()).toBe(previous);
  } finally {delete taro.createSelectorQuery;}
});

it("preserves multi-record aggregation when switching modes and saves single as latest", async () => {
  state.createDraft.mockResolvedValue({
    id: "singleton-draft",
    template: { entryMode: "single" },
  });
  await mountCreate();
  await input("榜单名称", "单次成绩");
  await click("展开计分规则");
  await click("累计");
  await click("每人一笔");
  expect(container.textContent).toContain("提交后可修改原记录");
  expect(container.textContent).not.toContain("取最高");
  await click("允许多笔");
  const sumButton = [...container.querySelectorAll("button")].find(
    button => button.textContent === "累计",
  );
  expect(sumButton?.classList.contains("chosen")).toBe(true);
  await click("每人一笔");
  await click("保存并继续");
  expect(state.createDraft).toHaveBeenCalledWith(
    expect.objectContaining({ entryMode: "single", aggregate: "latest" }),
    expect.any(String),
  );
  expect(container.querySelector(".share-ready-title")?.textContent).toBe("规则存好了");
});

it("does not activate a single-record board when the server omits the requested rule", async () => {
  state.entry = { kind: "group-tool" };
  await mountCreate();
  await input("榜单名称", "单次成绩");
  await click("展开计分规则");
  await click("每人一笔");
  await click("创建榜单");
  expect(state.createDraftBoard).not.toHaveBeenCalled();
  expect(container.textContent).toContain("暂时无法保存单笔规则");
  expect(container.querySelector(".saved-rules")).toBeNull();
});

it("routes singleton contribution directly to revision edit instead of adding another record", async () => {
  await mountBoard({myProfile:completeProfile,template:{name:"单次成绩",metric:"填写数值",unit:"分",entryMode:"single",period:"all_time"},myEntries:[{id:"original",value:"0",revision:4,createdAt:"2026-11-17T00:00:00Z"}]});
  await click("修改成绩");
  expect(state.fields.get("填写数值")!.value).toBe("0");
  await input("填写数值", "32");
  state.edit.mockResolvedValue({updated:true});
  await click("保存成绩");
  expect(state.edit).toHaveBeenCalledWith("custom-board","original","32",4);
  expect(state.submit).not.toHaveBeenCalled();
});

it("automatically edits a pending participant singleton and never appends on save", async () => {
  state.proxyEntries.mockResolvedValue([{id:"proxy-original",value:"12",revision:3,createdAt:"2026-11-17T00:00:00Z"}]);
  const changed = vi.fn();
  await act(async () => root.render(createElement(ProxySheet, {
    boardId:"board", participants:[proxyPerson], initialId:proxyPerson.id,
    template:{entryMode:"single",period:"all_time",unit:"分"} as any,
    writable:true,onClose:vi.fn(),onChanged:changed,
  }) as any));
  expect(state.fields.get("填写代填成绩")!.value).toBe("12");
  await input("填写代填成绩", "14");
  state.proxyEdit.mockResolvedValue({updated:true});
  await click("保存修改");
  expect(state.proxyEdit).toHaveBeenCalledWith("board","proxy-original","14",3);
  expect(state.proxySubmit).not.toHaveBeenCalled();
});


it("loads one verified neighboring page, holds the current one while waiting, and shares the new page", async () => {
  await mountBoard({ ranking: [podiumRow("first", 1)] });
  const first = await state.board.mock.results[0].value;
  state.currentGroup.mockResolvedValue({ boards: [{ id: first.id }, { id: "other-board" }] });
  await act(async () => state.hide());
  await act(async () => state.show());
  const second = {
    ...first, id: "other-board", draftId: "second-rules",
    template: { ...first.template, name: "夜跑里程" }, ranking: [], myEntries: [],
  };
  let finish!: (value: typeof second) => void;
  state.board.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  await click("下一页");
  expect(container.querySelector(".page-frame-title")?.textContent).toBe("读书页数");
  expect(container.textContent).toContain("正在翻页");
  expect(container.querySelector<HTMLButtonElement>('button[aria-label="下一页"]')?.disabled).toBe(true);
  expect(state.board).toHaveBeenLastCalledWith("other-board");
  const oldFrame = container.querySelector(".page-frame");
  await act(async () => finish(second));
  expect(container.querySelector(".page-frame-title")?.textContent).toBe("夜跑里程");
  expect(container.querySelector(".page-frame")).toBe(oldFrame);
  expect(container.querySelector(".rank-empty")).not.toBeNull();
  expect(state.pageScrollTo).toHaveBeenCalledWith({ scrollTop: 0, duration: 0 });
  expect(state.share().path).toBe("/pages/index/index?draft=second-rules&board=other-board");
  expect(container.querySelector<HTMLButtonElement>('button[aria-label="下一页"]')?.disabled).toBe(true);
  await click("第 2 页，共 2 页，返回目录");
  expect(state.reLaunch).toHaveBeenCalledWith({ url: "/pages/index/index" });
});

it("keeps the present page when an adjacent read fails and does not apply a late turn after hiding", async () => {
  await mountBoard();
  const original = await state.board.mock.results[0].value;
  state.currentGroup.mockResolvedValue({ boards: [{ id: original.id }, { id: "other-board" }] });
  await act(async () => state.hide());
  await act(async () => state.show());
  state.board.mockRejectedValueOnce(new Error("没有网络"));
  await click("下一页");
  expect(state.showToast).toHaveBeenCalledWith({ title: "没有网络", icon: "none" });
  expect(container.querySelector(".page-frame-title")?.textContent).toBe("读书页数");
  let finish!: (value: typeof original) => void;
  state.board.mockImplementationOnce(() => new Promise(resolve => { finish = resolve; }));
  await click("下一页");
  await act(async () => state.hide());
  state.generation += 1;
  await act(async () => finish({ ...original, id: "other-board" }));
  expect(container.querySelector(".notebook-leaf")).toBeNull();
  expect(state.pageScrollTo).not.toHaveBeenCalled();
});


it("turns a one-board notebook backward from its first page to the directory", async () => {
  await mountBoard();
  expect(container.querySelector("notebook-corner")?.getAttribute("label")).toBe("");
  await click("上一页，目录");
  expect(state.reLaunch).toHaveBeenCalledWith({ url: "/pages/index/index" });
});
