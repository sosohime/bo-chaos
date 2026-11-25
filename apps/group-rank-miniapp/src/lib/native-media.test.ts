import { beforeEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ entry: {} as Record<string, unknown>, pages: [] as { route: string; options: Record<string, unknown> }[] }));
vi.mock("@tarojs/taro", () => ({ default: { getEnterOptionsSync: () => state.entry, getCurrentPages: () => state.pages } }));
import { beginNativeAvatarSelection, consumeNativeMediaReturn, nativeMediaAppHidden, nativeMediaAppShown, nativeMediaInProgress, withNativeMedia } from "./native-media";

beforeEach(() => {
  state.pages = [];
  state.entry = { scene: 1044, path: "pages/index/index", shareTicket: "group-A-proof", query: { board: "A" } };
  nativeMediaAppHidden();
  nativeMediaAppShown();
  consumeNativeMediaReturn();
});

it.each([true, false])("keeps an album return when its completion arrives before foreground: %s", async (completeFirst) => {
  let finish!: (value: string) => void;
  const selection = withNativeMedia(() => new Promise<string>((resolve) => { finish = resolve; }));
  expect(nativeMediaInProgress()).toBe(true);
  nativeMediaAppHidden();
  if (completeFirst) { finish("local-photo"); await selection; }
  expect(nativeMediaAppShown()).toBe(true);
  expect(consumeNativeMediaReturn()).toBe(true);
  expect(consumeNativeMediaReturn()).toBe(false);
  if (!completeFirst) { finish("local-photo"); expect(await selection).toBe("local-photo"); }
  nativeMediaAppHidden();
  expect(nativeMediaAppShown()).toBe(false);
});

it.each(["shareTicket", "scene", "path", "query"])("resolves a fresh external entry when %s changes during selection", async (field) => {
  let finish!: () => void;
  const selection = withNativeMedia(() => new Promise<void>((resolve) => { finish = resolve; }));
  nativeMediaAppHidden();
  state.entry = { ...state.entry, [field]: field === "scene" ? 1001 : field === "query" ? { board: "B" } : "different" };
  expect(nativeMediaAppShown()).toBe(false);
  expect(consumeNativeMediaReturn()).toBe(false);
  finish(); await selection;
});

it("does not exempt a later foreground after a picker finishes without hiding the app", async () => {
  await withNativeMedia(async () => "cancelled");
  nativeMediaAppHidden();
  expect(nativeMediaAppShown()).toBe(false);
});


it("keeps a picker return whose path/query becomes the exact pre-existing internal page", async () => {
  state.pages = [{ route: "pages/board/index", options: { id: "A" } }];
  let finish!: () => void;
  const selection = withNativeMedia(() => new Promise<void>((resolve) => { finish = resolve; }));
  nativeMediaAppHidden(); finish(); await selection;
  state.entry = { ...state.entry, path: "pages/board/index", query: { id: "A" } };
  expect(nativeMediaAppShown()).toBe(true);
  expect(consumeNativeMediaReturn()).toBe(true);
});

it("does not preserve an editor when the group proof changes on an internal-looking route", async () => {
  state.pages = [{ route: "pages/board/index", options: { id: "A" } }];
  let finish!: () => void;
  const selection = withNativeMedia(() => new Promise<void>((resolve) => { finish = resolve; }));
  nativeMediaAppHidden(); finish(); await selection;
  state.entry = { ...state.entry, path: "pages/board/index", query: { id: "A" }, shareTicket: "group-B-proof" };
  expect(nativeMediaAppShown()).toBe(false);
});


it("preserves a native avatar picker cancellation and releases its pending selection on foreground", () => {
  const finish = beginNativeAvatarSelection();
  nativeMediaAppHidden();
  expect(nativeMediaAppShown()).toBe(true);
  expect(consumeNativeMediaReturn()).toBe(true);
  expect(nativeMediaInProgress()).toBe(false);
  finish();
  nativeMediaAppHidden();
  expect(nativeMediaAppShown()).toBe(false);
});

it("preserves an avatar result delivered before foreground and rejects a changed group", () => {
  const finish = beginNativeAvatarSelection();
  nativeMediaAppHidden(); finish();
  expect(nativeMediaAppShown()).toBe(true);
  expect(consumeNativeMediaReturn()).toBe(true);
  const finishOther = beginNativeAvatarSelection();
  nativeMediaAppHidden();
  state.entry = { ...state.entry, shareTicket: "another-group-proof" };
  expect(nativeMediaAppShown()).toBe(false);
  expect(nativeMediaInProgress()).toBe(false);
  finishOther();
});


it("uses the actual foreground event when the synchronous entry API is stale at picker start", async () => {
  const foreground = { scene: 1013, path: "pages/index/index", query: {} };
  state.entry = { scene: 1001, query: {} };
  nativeMediaAppShown(foreground);
  state.pages = [{ route: "pages/create/index", options: {} }];
  let finish!: () => void;
  const selection = withNativeMedia(() => new Promise<void>((resolve) => { finish = resolve; }));
  nativeMediaAppHidden(); finish(); await selection;
  state.entry = foreground;
  expect(nativeMediaAppShown(foreground)).toBe(true);
  expect(consumeNativeMediaReturn()).toBe(true);
});

it("uses a fresh foreground proof instead of a stale synchronous entry for media-return isolation", async () => {
  nativeMediaAppShown(state.entry);
  let finish!: () => void;
  const selection = withNativeMedia(() => new Promise<void>((resolve) => { finish = resolve; }));
  nativeMediaAppHidden(); finish(); await selection;
  const differentGroup = { ...state.entry, shareTicket: "new-group-proof" };
  expect(nativeMediaAppShown(differentGroup)).toBe(false);
  expect(consumeNativeMediaReturn()).toBe(false);
});


it("keeps the physical album-QR resume when WeChat refreshes scene 1001 to 1013 on the exact editor", async () => {
  const ordinary = { scene: 1001, path: "pages/index/index", query: {} };
  state.entry = ordinary;
  nativeMediaAppShown(ordinary);
  state.pages = [{ route: "pages/create/index", options: {} }];
  let finish!: () => void;
  const selection = withNativeMedia(() => new Promise<void>((resolve) => { finish = resolve; }));
  nativeMediaAppHidden(); finish(); await selection;
  const resume = { scene: 1013, path: "pages/create/index", query: {} };
  state.entry = resume;
  expect(nativeMediaAppShown(resume)).toBe(true);
  expect(consumeNativeMediaReturn()).toBe(true);
});

it.each(["shareTicket", "chatType", "query", "path"])("rejects a changed %s on a scene-refreshing editor resume", async (field) => {
  state.entry = { scene: 1001, path: "pages/index/index", query: {} };
  nativeMediaAppShown(state.entry);
  state.pages = [{ route: "pages/create/index", options: {} }];
  let finish!: () => void;
  const selection = withNativeMedia(() => new Promise<void>((resolve) => { finish = resolve; }));
  nativeMediaAppHidden(); finish(); await selection;
  state.entry = { scene: 1013, path: "pages/create/index", query: {}, [field]: field === "query" ? { draft: "different" } : field === "chatType" ? 3 : "changed" };
  expect(nativeMediaAppShown(state.entry)).toBe(false);
});
