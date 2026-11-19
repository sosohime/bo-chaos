// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { clearGroupDisplayContext, setGroupDisplayContext } from "./group-display";
const native = vi.hoisted(() => ({ renderGroupName: vi.fn() }));
vi.mock("@tarojs/components", () => ({
  View: "div", Text: "span",
  OpenData: () => { native.renderGroupName(); return createElement("span", null, "private group name"); },
}));
import GroupName from "../components/group-name";
let root: ReturnType<typeof createRoot> | undefined;
afterEach(() => {
  if (root) act(() => root!.unmount());
  root = undefined;
  clearGroupDisplayContext();
  document.body.innerHTML = "";
  native.renderGroupName.mockClear();
  vi.unstubAllGlobals();
});
it("keeps the group label without mounting the native renderer that triggers WeChat's notice", () => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  act(() => root!.render(createElement(GroupName) as never));
  act(() => setGroupDisplayContext("A", Date.now() + 60000));
  act(() => root!.render(createElement(GroupName) as never));
  expect(container.textContent).toBe("本群");
  expect(native.renderGroupName).not.toHaveBeenCalled();
});
