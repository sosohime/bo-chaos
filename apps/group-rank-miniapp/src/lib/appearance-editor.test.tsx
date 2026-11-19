// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({
  choose: vi.fn(),
  privacy: vi.fn(),
  info: vi.fn(),
  fileInfo: vi.fn(),
  compress: vi.fn(),
  upload: vi.fn(),
  sliders: [] as any[],
}));
vi.mock("@tarojs/taro", () => ({
  default: {
    chooseMedia: state.choose,
    getPrivacySetting: state.privacy,
    getImageInfo: state.info,
    getFileInfo: state.fileInfo,
    compressImage: state.compress,
    nextTick: (f: () => void) => f(),
    createSelectorQuery: () => {
      const query: any = {
        select: () => query,
        boundingClientRect: () => query,
        exec: (f: any) => f([{ width: 300, height: 70 }]),
      };
      return query;
    },
  },
}));
vi.mock("@tarojs/components", () => ({
  View: ({
    children,
    catchMove,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    ...p
  }: any) => createElement("div", { ...p, onTouchStart, onTouchMove, onTouchEnd }, children),
  Image: ({ mode, ...p }: any) => createElement("img", p),
  Text: "span",
  Button: ({ loading, openType, onAgreePrivacyAuthorization, ...p }: any) =>
    createElement("button", {
      ...p,
      ...(openType === "agreePrivacyAuthorization"
        ? { onClick: onAgreePrivacyAuthorization }
        : {}),
    }),
  Slider: (p: any) => {
    state.sliders.push(p);
    return createElement("input", {
      type: "range",
      value: p.value,
      readOnly: true,
    });
  },
}));
vi.mock("./api", () => ({
  groupApi: { uploadBackground: state.upload },
  currentGroupGeneration: () => 0,
  newRequestId: () => "same-retry-id",
}));
import AppearanceEditor from "../components/appearance-editor";
let root: ReturnType<typeof createRoot>,
  container: HTMLDivElement,
  onApply: ReturnType<typeof vi.fn>;
beforeEach(async () => {
  vi.resetAllMocks();
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  state.sliders = [];
  state.privacy.mockImplementation(({ success }: any) =>
    success({ needAuthorization: false }),
  );
  state.choose.mockResolvedValue({
    tempFiles: [{ tempFilePath: "local-image" }],
  });
  state.info.mockResolvedValue({ width: 1200, height: 800 });
  state.fileInfo.mockResolvedValue({ size: 100 * 1024 });
  state.upload.mockResolvedValue({
    assetId: "approved",
    imageWidth: 900,
    imageHeight: 600,
  });
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  onApply = vi.fn();
  await act(async () =>
    root.render(
      createElement(AppearanceEditor, {
        value: { themeId: "volt", background: null },
        name: "尿酸王",
        onApply,
      }) as any,
    ),
  );
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});
async function click(label: string) {
  const button = [...container.querySelectorAll("button")].find(
    (e) => e.textContent === label,
  )!;
  expect(button).toBeDefined();
  await act(async () => button.click());
}
it("keeps a failed review local, retries the same intent and only applies approved server dimensions", async () => {
  await click(container.querySelector(".appearance-choose")!.textContent!);
  state.upload.mockRejectedValueOnce(new Error("审核暂不可用"));
  await click("保存外观");
  expect(onApply).not.toHaveBeenCalled();
  expect(container.textContent).toContain("审核暂不可用");
  await click("保存外观");
  expect(state.upload.mock.calls).toEqual([
    ["local-image", "same-retry-id"],
    ["local-image", "same-retry-id"],
  ]);
  expect(onApply.mock.calls[0][0].background).toMatchObject({
    assetId: "approved",
    imageWidth: 900,
    imageHeight: 600,
  });
});
it("keeps cover and card crops independent", async () => {
  await click(container.querySelector(".appearance-choose")!.textContent!);
  await click("列表缩略图");
  const zoom = state.sliders.at(-2);
  await act(async () => zoom.onChange({ detail: { value: 160 } }));
  await click("保存外观");
  expect(onApply.mock.calls[0][0].background.cover).toEqual({
    x: 0.5,
    y: 0.5,
    zoom: 1,
  });
  expect(onApply.mock.calls[0][0].background.card).toEqual({
    x: 0.5,
    y: 0.5,
    zoom: 1.6,
  });
});
it("follows a pinch and uploads the compressed source once per selection", async () => {
  state.info.mockResolvedValueOnce({ width: 2400, height: 1600 })
    .mockResolvedValueOnce({ width: 1440, height: 960 });
  state.fileInfo.mockResolvedValueOnce({ size: 3_000_000 })
    .mockResolvedValueOnce({ size: 180_000 });
  state.compress.mockResolvedValue({ tempFilePath: "compressed-image" });
  await click("上传背景图片");
  const preview = container.querySelector(".appearance-crop")!;
  for (const [type, left, right] of [["touchstart", 110, 190], ["touchmove", 90, 210]] as const) {
    const event = new Event(type, { bubbles: true });
    Object.defineProperty(event, "touches", {
      value: [{ clientX: left, clientY: 35 }, { clientX: right, clientY: 35 }],
    });
    await act(async () => preview.dispatchEvent(event));
  }
  expect(container.querySelector(".appearance-zoom-label")?.textContent).toContain("150%");
  state.upload.mockRejectedValueOnce(new Error("暂不可用"));
  await click("保存外观");
  await click("保存外观");
  expect(state.compress).toHaveBeenCalledExactlyOnceWith(
    { src: "local-image", quality: 74, compressedWidth: 1440 },
  );
  expect(state.upload.mock.calls).toEqual([
    ["compressed-image", "same-retry-id"],
    ["compressed-image", "same-retry-id"],
  ]);
  expect(onApply.mock.calls[0][0].background.cover.zoom).toBe(1.5);
});
it("discards an old picker result after a newer selection", async () => {
  let finish!: (v: any) => void;
  state.info.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await click(container.querySelector(".appearance-choose")!.textContent!);
  state.choose.mockResolvedValueOnce({
    tempFiles: [{ tempFilePath: "new-image" }],
  });
  await click(container.querySelector(".appearance-choose")!.textContent!);
  await act(async () => finish({ width: 5, height: 10 }));
  await click("保存外观");
  expect(state.upload).toHaveBeenCalledWith("new-image", "same-retry-id");
});
it("does not apply a late upload after leaving the editor", async () => {
  await click(container.querySelector(".appearance-choose")!.textContent!);
  let finish!: (v: any) => void;
  state.upload.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await click("保存外观");
  await act(async () => root.render(null));
  await act(async () =>
    finish({ assetId: "late", imageWidth: 100, imageHeight: 100 }),
  );
  expect(onApply).not.toHaveBeenCalled();
});
it("clears a custom background only by explicit reset", async () => {
  await click(container.querySelector(".appearance-choose")!.textContent!);
  await click("使用当前预设");
  await click("保存外观");
  expect(state.upload).not.toHaveBeenCalled();
  expect(onApply.mock.calls[0][0].background).toBeNull();
});

it("does not open the album before required platform privacy consent", async () => {
  state.privacy.mockImplementationOnce(({ success }: any) =>
    success({ needAuthorization: true }),
  );
  await click(container.querySelector(".appearance-choose")!.textContent!);
  expect(state.choose).not.toHaveBeenCalled();
  expect(container.textContent).toContain("选中的图片将用于群内榜单背景");
  await click("同意并选图");
  expect(state.choose).toHaveBeenCalledTimes(1);
});

it("shows real upload then persistence stages, prevents double apply and preserves the photo during color changes", async () => {
  await click("上传背景图片");
  await click("玫红");
  let upload!: (v:any) => void, saved!: () => void;
  state.upload.mockImplementation(() => new Promise(resolve => { upload = resolve; }));
  onApply.mockImplementation(() => new Promise<void>(resolve => { saved = resolve; }));
  await click("保存外观");
  expect(container.querySelector(".action-pending")?.textContent).toBe("正在上传并审核…");
  expect((container.querySelector(".action-pending") as HTMLButtonElement).disabled).toBe(true);
  await act(async () => (container.querySelector(".action-pending") as HTMLButtonElement).click());
  expect(state.upload).toHaveBeenCalledTimes(1);
  await act(async () => upload({ assetId:"approved",imageWidth:900,imageHeight:600 }));
  expect(container.querySelector(".action-pending")?.textContent).toBe("正在保存外观…");
  expect(onApply).toHaveBeenCalledWith(expect.objectContaining({accentColor:"#F65D9B",background:expect.objectContaining({assetId:"approved"})}));
  await act(async () => saved());
  expect(container.querySelector(".action-pending")).toBeNull();
});
it("changes color without uploading or deleting an approved custom photo", async () => {
  await act(async () => root.render(createElement(AppearanceEditor, {
    key:"approved-photo",value:{themeId:"volt",background:{assetId:"existing",imageWidth:900,imageHeight:600,cover:{x:.5,y:.5,zoom:1},card:{x:.5,y:.5,zoom:1},dim:.35}},
    name:"积分",onApply,
  }) as any));
  await click("青色");
  await click("保存外观");
  expect(state.upload).not.toHaveBeenCalled();
  expect(onApply).toHaveBeenCalledWith(expect.objectContaining({accentColor:"#39C5BB",background:expect.objectContaining({assetId:"existing"})}));
});
