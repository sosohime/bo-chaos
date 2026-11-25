// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, afterEach, it, expect, vi } from "vitest";
const state = vi.hoisted(() => ({
  read: vi.fn(),
  intersection: (_event: any) => {},
  disconnect: vi.fn(),
}));
vi.mock("@tarojs/taro", () => ({
  default: {
    getCurrentInstance: () => ({ page: {} }),
    nextTick: (f: any) => f(),
    createIntersectionObserver: () => {
      const observer: any = {
        relativeToViewport: () => observer,
        observe: (_s: any, cb: any) => {
          state.intersection = cb;
        },
        disconnect: state.disconnect,
      };
      return observer;
    },
    createSelectorQuery: () => {
      const q: any = {
        select: () => q,
        boundingClientRect: () => q,
        exec: (f: any) => f([{ width: 100, height: 100 }]),
      };
      return q;
    },
  },
}));
vi.mock("@tarojs/components", () => ({
  View: ({ children, ...p }: any) => createElement("div", p, children),
  Text: "span",
  Image: ({ mode, ...p }: any) => createElement("img", p),
}));
vi.mock("./api", () => ({
  groupApi: { background: state.read },
  currentGroupGeneration: () => 0,
}));
import ArenaBackground from "../components/arena-background";
const background = {
  assetId: "approved",
  imageWidth: 1000,
  imageHeight: 500,
  cover: { x: 0.5, y: 0.5, zoom: 1 },
  card: { x: 0.5, y: 0.5, zoom: 1 },
  dim: 0.3,
};
let root: ReturnType<typeof createRoot>, container: HTMLDivElement;
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  state.read.mockResolvedValue("private-file");
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});
it("does not download offscreen catalog photos and downloads once when approaching the viewport", async () => {
  await act(async () =>
    root.render(
      createElement(ArenaBackground, {
        background,
        boardId: "board",
        slot: "card",
      }) as any,
    ),
  );
  expect(state.read).not.toHaveBeenCalled();
  await act(async () => state.intersection({ intersectionRatio: 0 }));
  expect(state.read).not.toHaveBeenCalled();
  await act(async () => state.intersection({ intersectionRatio: 0.1 }));
  await act(async () => state.intersection({ intersectionRatio: 1 }));
  expect(state.read).toHaveBeenCalledTimes(1);
  expect(state.disconnect).toHaveBeenCalled();
});
it("does not start a stale observer request after leaving the list", async () => {
  await act(async () =>
    root.render(
      createElement(ArenaBackground, {
        background,
        boardId: "board",
        slot: "card",
      }) as any,
    ),
  );
  await act(async () => root.render(null));
  await act(async () => state.intersection({ intersectionRatio: 1 }));
  expect(state.read).not.toHaveBeenCalled();
});
it("loads the focused detail cover immediately", async () => {
  await act(async () =>
    root.render(
      createElement(ArenaBackground, {
        background,
        boardId: "board",
        slot: "cover",
      }) as any,
    ),
  );
  expect(state.read).toHaveBeenCalledWith("board", "approved", undefined, undefined);
});
it("loads a dedicated cover and lazy thumbnail, with the full source reserved for editing", async () => {
  const saved = { ...background, renditions: { cover: "cover-v1", card: "card-v1" } };
  await act(async () => root.render(createElement(ArenaBackground, {
    background: saved, boardId: "board", slot: "card",
  }) as any));
  expect(state.read).not.toHaveBeenCalled();
  await act(async () => state.intersection({ intersectionRatio: 1 }));
  expect(state.read).toHaveBeenLastCalledWith("board", "approved", "card", "card-v1");
  expect(container.querySelector("img.arena-rendition")).not.toBeNull();
  await act(async () => root.render(createElement(ArenaBackground, {
    background: saved, boardId: "board",
  }) as any));
  expect(state.read).toHaveBeenLastCalledWith("board", "approved", "cover", "cover-v1");
  await act(async () => root.render(createElement(ArenaBackground, {
    background: saved, boardId: "board", onViewport: () => {},
  }) as any));
  expect(state.read).toHaveBeenLastCalledWith("board", "approved", undefined, undefined);
  expect(container.querySelector("img.arena-rendition")).toBeNull();
});
