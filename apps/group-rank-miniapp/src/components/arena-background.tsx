import { useEffect, useRef, useState } from "react";
import { Image, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import type { GroupRankBackground, GroupRankThemeId } from "@mono/types";
import { currentGroupGeneration, groupApi } from "../lib/api";
import { cropGeometry } from "../lib/background-crop";
import { createVisualMemory } from "../lib/visual-memory";
import "./arena-background.scss";
export const materialForTheme = (theme: GroupRankThemeId = "volt", slot: "cover" | "card" | "preview" = "cover", hero = false) => {
  if (hero) return "/assets/arena/hero-ribbon-v3.png";
  const material = theme === "coral" ? "track" : theme === "midnight" ? "pixel" : "crystal";
  if (slot === "preview") return `/assets/arena/${material}-preview-v1.jpg`;
  const version = material === "crystal" ? 3 : material === "pixel" ? 4 : 1;
  return `/assets/arena/${material}${slot === "card" ? `-card-v${version}` : ""}.jpg`;
};
type Viewport = { width: number; height: number; left: number; top: number };
type CoverVisual = { path: string; size: Viewport };
const loadedCovers = createVisualMemory<CoverVisual>(8);
let nextId = 0;
export default function ArenaBackground({
  theme = "volt",
  background,
  source,
  boardId,
  slot = "cover",
  dim = true,
  onViewport,
  layoutKey,
  presetLayout,
}: {
  theme?: GroupRankThemeId;
  background?: GroupRankBackground | null;
  source?: string;
  boardId?: string;
  slot?: "cover" | "card";
  dim?: boolean;
  onViewport?: (size: Viewport) => void;
  layoutKey?: string;
  presetLayout?: "detail" | "hero" | "preview";
}) {
  const [id] = useState(() => `arena-material-${++nextId}`);
  const [size, setSize] = useState({ width: 0, height: 0, left: 0, top: 0 });
  const [download, setDownload] = useState<{
    key: string;
    path: string;
  } | null>(null);
  const [pendingKey, setPendingKey] = useState("");
  const [failed, setFailed] = useState("");
  const nativePage = useRef(Taro.getCurrentInstance?.().page);
  const viewportCallback = useRef(onViewport);
  viewportCallback.current = onViewport;
  const cropVersion = !onViewport && !source ? background?.renditions?.[slot] : undefined;
  const gen = currentGroupGeneration(),
    key = `${gen}:${boardId}:${background?.assetId}:${cropVersion ? slot + ':' + cropVersion : 'source'}`;
  const [coverFailedKey, setCoverFailedKey] = useState("");
  const customCover = !!background && !!boardId && presetLayout === "detail";
  const cacheKey = `${key}:${slot}:${layoutKey ?? ""}`;
  const cached = background && boardId && !source ? loadedCovers.get(gen, cacheKey) : undefined;
  useEffect(() => {
    let active = true,
      started = false;
    setFailed("");
    let observer: Taro.IntersectionObserver | undefined;
    const load = () => {
      if (!active || started || !background || !boardId || source || cached) return;
      started = true;
      setPendingKey(key);
      void groupApi
        .background(boardId, background.assetId, cropVersion ? slot : undefined, cropVersion)
        .then((path) => {
          if (active && gen === currentGroupGeneration())
            setDownload({ key, path });
        })
        .catch(() => {
          if (active) {
            setPendingKey("");
            setCoverFailedKey(key);
          }
        });
    };
    if (background && boardId && !source) {
      if (slot === "cover" || viewportCallback.current) load();
      else if (
        nativePage.current &&
        typeof Taro.createIntersectionObserver === "function"
      ) {
        Taro.nextTick(() => {
          if (!active) return;
          try {
            observer = Taro.createIntersectionObserver(nativePage.current!, {
              thresholds: [0],
            }).relativeToViewport({ bottom: 240 });
            observer.observe(`#${id}`, (event) => {
              if ((event.intersectionRatio || 0) > 0) {
                observer?.disconnect();
                load();
              }
            });
          } catch {
            observer?.disconnect();
          }
        });
      }
      // Unsupported observers keep the selected preset in the directory; detail still loads the image.
    }
    return () => {
      active = false;
      observer?.disconnect();
    };
  }, [key, source, slot, cacheKey]);
  useEffect(() => {
    if (!background || cropVersion) return;
    const measure = () =>
      Taro.nextTick(() => {
        Taro.createSelectorQuery()
          .select(`#${id}`)
          .boundingClientRect()
          .exec((rects) => {
            const r = rects[0];
            if (r?.width && r?.height) {
              const next = { width: r.width, height: r.height, left: r.left ?? 0, top: r.top ?? 0 };
              setSize(next);
              viewportCallback.current?.(next);
            }
          });
      });
    measure();
    Taro.onWindowResize?.(measure);
    return () => Taro.offWindowResize?.(measure);
  }, [id, slot, background?.assetId, layoutKey, cropVersion]);
  const path = source || (download?.key === key ? download.path : "") || cached?.path || "";
  const cropSize = size.width ? size : cached?.size ?? size;
  const custom = background && path && failed !== path;
  // A custom cover keeps its base color while decoding; the preset is only a failure fallback.
  const waitingForCustom = customCover && coverFailedKey !== key && (!path || failed !== path);
  const geometry = custom && !cropVersion && cropSize.width
    ? cropGeometry(
        background.imageWidth,
        background.imageHeight,
        cropSize.width,
        cropSize.height,
        background[slot],
      )
    : null;
  return (
    <View
      id={id}
      className={`arena-background arena-background-${slot}`}
      aria-hidden
    >
      {custom && (geometry || cropVersion) ? (
        <Image
          className={`arena-crop-image${cropVersion ? " arena-rendition" : ""}${customCover && pendingKey === key ? " arena-cover-decoding" : ""}`}
          src={path}
          style={geometry ? {
            width: `${geometry.width}px`,
            height: `${geometry.height}px`,
            left: `${geometry.left}px`,
            top: `${geometry.top}px`,
          } : undefined}
          mode={cropVersion ? "aspectFill" : "scaleToFill"}
          onLoad={() => {
            if (boardId && background && !source && currentGroupGeneration() === gen)
              loadedCovers.set(gen, cacheKey, { path, size: cropSize });
            setPendingKey("");
          }}
          onError={() => {
            loadedCovers.delete(gen, cacheKey);
            setFailed(path);
            setCoverFailedKey(key);
            setPendingKey("");
          }}
        />
      ) : !waitingForCustom && (
        <Image
          className={`arena-preset-image ${presetLayout ? `arena-preset-${presetLayout}` : ""}`}
          src={materialForTheme(theme, presetLayout === "preview" ? "preview" : slot, presetLayout === "hero")}
          mode={presetLayout === "hero" ? "aspectFit" : "aspectFill"}
        />
      )}
      {dim && (
        <View
          className="arena-image-dim"
          style={{
            backgroundColor: `rgba(0,0,0,${custom ? background.dim : 0.08})`,
          }}
        />
      )}
      {dim && <View className="arena-image-shade" />}
      {pendingKey === key && <View className="asset-loading" aria-hidden />}
    </View>
  );
}
