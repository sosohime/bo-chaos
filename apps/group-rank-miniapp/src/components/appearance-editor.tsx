import { ActionButton, LoadStatus } from "./async-feedback";
import { useEffect, useRef, useState } from "react";
import { Button, Image, Slider, Text, View, type ITouchEvent } from "@tarojs/components";
import Taro from "@tarojs/taro";
import type {
  GroupRankBackground,
  GroupRankCrop,
  GroupRankThemeId,
} from "@mono/types";
import ArenaBackground, { materialForTheme } from "./arena-background";
import ArtLettering from "./art-lettering";
import { useSheetLayout } from "./bottom-sheet";
import PalettePicker from "./palette-picker";
import { paletteStyle, themeColor, validColor } from "../lib/palette";
import { themes } from "../lib/theme";
import { groupApi, newRequestId } from "../lib/api";
import { withNativeMedia } from "../lib/native-media";
import { prepareBackgroundImage } from "../lib/background-image";
import {
  centeredCrop,
  cropGeometry,
  dragCrop,
  orientedImageSize,
  pinchCrop,
} from "../lib/background-crop";
import "./appearance-editor.scss";
export type AppearanceValue = {
  themeId: GroupRankThemeId;
  accentColor?: string | null;
  background: GroupRankBackground | null;
  localSource?: string;
};
/** The temporary photo remains local until explicit Apply; failed review never replaces saved appearance. */
export default function AppearanceEditor({
  value,
  name,
  boardId,
  busy = false,
  docked = false,
  saveError = "",
  onApply,
}: {
  value: AppearanceValue;
  name: string;
  boardId?: string;
  busy?: boolean;
  docked?: boolean;
  saveError?: string;
  onApply: (next: AppearanceValue) => void | Promise<void>;
}) {
  const measureSheet = useSheetLayout();
  useEffect(measureSheet);
  const [edit, setEdit] = useState(value),
    [source, setSource] = useState(value.localSource || ""),
    [slot, setSlot] = useState<"cover" | "card">("cover"),
    [uploading, setUploading] = useState(false),
    [applying, setApplying] = useState(false),
    [preparing, setPreparing] = useState(false),
    [error, setError] = useState(""),
    [privacyOpen, setPrivacyOpen] = useState(false);
  const intent = useRef(0),
    alive = useRef(true),
    request = useRef(newRequestId()),
    lock = useRef(false);
  useEffect(
    () => () => {
      alive.current = false;
      ++intent.current;
    },
    [],
  );
  const viewport = useRef({ width: 0, height: 0, left: 0, top: 0 });
  const drag = useRef<{
    x: number;
    y: number;
    distance: number;
    crop: GroupRankCrop;
  } | null>(null);
  const prepared = useRef("");
  async function choose(authorised = false) {
    const current = ++intent.current;
    try {
      if (!authorised && typeof Taro.getPrivacySetting === "function") {
        const setting =
          await new Promise<Taro.getPrivacySetting.SuccessCallbackResult>(
            (resolve, reject) =>
              Taro.getPrivacySetting({ success: resolve, fail: reject }),
          );
        if (current !== intent.current || !alive.current) return;
        if (setting.needAuthorization) {
          setPrivacyOpen(true);
          return;
        }
      }
      const selected = await withNativeMedia(() => Taro.chooseMedia({
        count: 1,
        mediaType: ["image"],
        sourceType: ["album"],
        sizeType: ["compressed"],
      }));
      const path = selected.tempFiles[0]?.tempFilePath;
      if (!path || current !== intent.current) return;
      setPreparing(true);
      const info = await Taro.getImageInfo({ src: path });
      if (current !== intent.current) return;
      const size = orientedImageSize(info.width, info.height, info.orientation);
      setSource(path);
      setSlot("cover");
      request.current = newRequestId();
      prepared.current = "";
      drag.current = null;
      setError("");
      setEdit((p) => ({
        ...p,
        background: {
          assetId: "",
          imageWidth: size.width,
          imageHeight: size.height,
          cover: centeredCrop(),
          card: centeredCrop(),
          dim: 0.35,
        },
      }));
    } catch (reason) {
      if (
        current === intent.current &&
        !String((reason as { errMsg?: string })?.errMsg).includes("cancel")
      )
        setError(
          reason instanceof Error ? reason.message : "无法选择图片，请重试",
        );
    } finally {
      if (current === intent.current && alive.current) setPreparing(false);
    }
  }
  const updateCrop = (c: GroupRankCrop) =>
    setEdit((p) =>
      p.background ? { ...p, background: { ...p.background, [slot]: c } } : p,
    );
  function moveImage(event: ITouchEvent, starting = false) {
    const [first, second] = event.touches;
    const photo = edit.background;
    const rect = viewport.current;
    if (!first || !photo || disabled || !rect.width || !rect.height) return;
    const x = (first.clientX + (second?.clientX ?? first.clientX)) / 2 - rect.left;
    const y = (first.clientY + (second?.clientY ?? first.clientY)) / 2 - rect.top;
    const distance = second ? Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY) : 0;
    const previous = drag.current;
    const image = { width: photo.imageWidth, height: photo.imageHeight };
    if (starting || !previous || !!previous.distance !== !!distance) {
      drag.current = { x, y, distance, crop: photo[slot] };
      return;
    }
    if (distance) {
      updateCrop(pinchCrop(previous.crop, image, rect, previous, { x, y }, distance / previous.distance));
    } else {
      const { travelX, travelY } = cropGeometry(image.width, image.height, rect.width, rect.height, previous.crop);
      updateCrop(dragCrop(previous.crop, x - previous.x, y - previous.y, travelX, travelY));
    }
  }
  async function apply() {
    if (lock.current || busy || preparing) return;
    lock.current = true;
    setApplying(true);
    const current = intent.current;
    setError("");
    try {
      let background = edit.background;
      if (background && source && !background.assetId) {
        const uploadPath = prepared.current || await prepareBackgroundImage(source, {
          width: background.imageWidth,
          height: background.imageHeight,
        });
        if (current !== intent.current || !alive.current) return;
        prepared.current = uploadPath;
        setUploading(true);
        const asset = await groupApi.uploadBackground(uploadPath, request.current);
        if (current !== intent.current || !alive.current) return;
        background = { ...background, ...asset };
        setEdit((p) => ({ ...p, background }));
      }
      setUploading(false);
      await onApply({ ...edit, accentColor: validColor(edit.accentColor), background, localSource: source });
    } catch (reason) {
      if (current === intent.current)
        setError(
          reason instanceof Error ? reason.message : "背景没有保存成功，请重试",
        );
    } finally {
      lock.current = false;
      if (alive.current) { setUploading(false); setApplying(false); }
    }
  }
  function usePreset(themeId: GroupRankThemeId) {
    ++intent.current;
    setEdit(previous => ({ ...previous, themeId, background: null }));
    setSource("");
    setSlot("cover");
    setPreparing(false);
    setError("");
  }

  const disabled = busy || applying;
  return (
    <View className={`appearance-editor theme--${edit.themeId}`} style={paletteStyle(edit.accentColor)}>
      <Text className="appearance-preview-label">{slot === "cover" ? "榜页预览" : "目录缩略图"}</Text>
      {edit.background && (
          <View className="appearance-crop-tabs">
            {(["cover", "card"] as const).map((id) => (
              <Button
                key={id}
                className={slot === id ? "selected" : ""}
                disabled={disabled}
                onClick={() => {
                  if (slot === id) return;
                  drag.current = null;
                  viewport.current = { width: 0, height: 0, left: 0, top: 0 };
                  setSlot(id);
                }}
              >
                {id === "cover" ? "榜单头图" : "列表缩略图"}
              </Button>
            ))}
          </View>
      )}
      <View className="appearance-proof">
      <View
        className={`appearance-crop appearance-crop-${slot}`}
        catchMove
        onTouchStart={(event) => moveImage(event as ITouchEvent, true)}
        onTouchMove={(event) => moveImage(event as ITouchEvent)}
        onTouchEnd={() => {
          drag.current = null;
        }}
        onTouchCancel={() => { drag.current = null; }}
      >
        <ArenaBackground
          theme={edit.themeId}
          background={edit.background}
          source={source}
          boardId={boardId}
          slot={slot}
          presetLayout={slot === "cover" ? "detail" : undefined}
          onViewport={(size) => {
            viewport.current = size;
          }}
        />
        {slot === "cover" && <ArtLettering className="appearance-live-title" text={name || "你的榜单名"} role="board" />}
      </View>
      {slot === "cover" && <View className="appearance-proof-dock" aria-hidden><Text>目录</Text><Text className="appearance-proof-record">记一笔</Text></View>}
      </View>
      {edit.background && (
        <View className="appearance-zoom">
          <View className="appearance-zoom-label"><Text>拖动取景 · 双指缩放</Text><Text>{Math.round(edit.background[slot].zoom * 100)}%</Text></View>
          <Slider
            min={100}
            max={200}
            value={Math.round(edit.background[slot].zoom * 100)}
            disabled={disabled}
            activeColor={validColor(edit.accentColor) || themeColor(edit.themeId)}
            onChanging={(event) => updateCrop({ ...edit.background![slot], zoom: event.detail.value / 100 })}
            onChange={(event) => updateCrop({ ...edit.background![slot], zoom: event.detail.value / 100 })}
          />
        </View>
      )}
      <View className="appearance-background-heading"><Text>背景图片</Text>
        <Button
          className="appearance-choose"
          disabled={disabled}
          onClick={() => choose()}
        >
          {edit.background ? "更换背景图片" : "上传背景图片"}
        </Button>
      </View>
      {edit.background && <View className="appearance-upload-row">
          <Button
            className="text-action"
            disabled={disabled}
            onClick={() => usePreset(edit.themeId)}
          >
            使用当前预设
          </Button>
      </View>}
      {preparing && <LoadStatus label="正在读取图片" compact />}
      {<View className="appearance-theme-list">
        {themes.map((theme) => (
          <Button
            key={theme.id}
            disabled={disabled}
            className={`appearance-theme ${!edit.background && edit.themeId === theme.id ? "selected" : ""}`}
            onClick={() => usePreset(theme.id)}
          >
            <Image src={materialForTheme(theme.id, "card")} mode="aspectFill" />
            <Text>{theme.name}</Text>
          </Button>
        ))}
      </View>}
      <PalettePicker value={edit.accentColor} theme={edit.themeId} disabled={disabled} onChange={color => { setEdit(p => ({ ...p, accentColor: color })); setError(""); }} />
      {privacyOpen && (
        <View className="appearance-privacy">
          <Text>选中的图片将用于群内榜单背景。</Text>
          <Button
            className="text-action"
            onClick={() =>
              Taro.openPrivacyContract({
                fail: () => setError("暂时无法打开隐私指引，请稍后重试"),
              })
            }
          >
            查看隐私保护指引
          </Button>
          <View>
            <Button
              className="text-action"
              onClick={() => setPrivacyOpen(false)}
            >
              取消
            </Button>
            <Button
              className="action small-action"
              openType="agreePrivacyAuthorization"
              onAgreePrivacyAuthorization={() => {
                setPrivacyOpen(false);
                void choose(true);
              }}
            >
              同意并选图
            </Button>
          </View>
        </View>
      )}

      {edit.background && (
        <>

          <Text className="appearance-slider-label">压暗背景</Text>
          <Slider
            min={25}
            max={80}
            value={Math.round(edit.background.dim * 100)}
            disabled={disabled}
            activeColor={validColor(edit.accentColor) || themeColor(edit.themeId)}
            onChanging={(event) =>
              setEdit((p) => ({
                ...p,
                background: p.background
                  ? { ...p.background, dim: event.detail.value / 100 }
                  : null,
              }))
            }
            onChange={(event) =>
              setEdit((p) => ({
                ...p,
                background: p.background
                  ? { ...p.background, dim: event.detail.value / 100 }
                  : null,
              }))
            }
          />
        </>
      )}
      {(error || saveError) && (
        <Text className="form-error">{error || saveError}</Text>
      )}
      <View className={docked ? "appearance-apply-dock" : "appearance-apply"}>
        <ActionButton
          className="action"
          disabled={disabled || preparing}
          loading={busy || applying}
          pendingLabel={uploading ? "正在上传并审核…" : applying && source && !edit.background?.assetId ? "正在压缩图片…" : "正在保存外观…"}
          onClick={apply}
        >
          {docked ? "使用此外观" : "保存外观"}
        </ActionButton>
      </View>
    </View>
  );
}
