import { PageMeta, Text, View } from "@tarojs/components";
import Taro from "@tarojs/taro";
import { useViewport, viewportStyle } from "../lib/viewport";
import { paletteStyle } from "../lib/palette";
import { syncNavigationTheme } from "../lib/theme";
import {
  createContext,
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import "./page-frame.scss";
export const FrameTheme = createContext("volt");
export const FrameAccent = createContext<string | null>(null);

/** Current frame metrics for non-component consumers. */
export function readFrameMetrics() { return viewportStyle(); }

export default function PageFrame({
  className,
  accentColor,
  header,
  title,
  nativeTitle,
  scrollLocked = false,
  scrollOffset = 0,
  children,
}: {
  className?: string;
  accentColor?: string | null;
  header?: ReactNode;
  title?: string;
  nativeTitle?: string;
  scrollLocked?: boolean;
  scrollOffset?: number;
  children: ReactNode;
}) {
  const viewport = useViewport();
  const metrics = viewportStyle(viewport);
  const frameTheme = className?.match(/theme--(volt|midnight|coral)/)?.[1] || "volt";
  const nativeLabel = nativeTitle || title || "博哥的小本儿";
  // A newly pushed native page can reset capsule/status ink after React mounts.
  // Reapply at the page-ready boundary, when that page owns the native chrome.
  const applyNativeChrome = () => {
    if (typeof Taro.nextTick === "function") Taro.nextTick(() => syncNavigationTheme(frameTheme));
    else syncNavigationTheme(frameTheme);
  };
  Taro.useReady?.(applyNativeChrome);
  Taro.useDidShow?.(applyNativeChrome);
  useEffect(() => {
    let active = true;
    const applyColor = () => {
      if (active) syncNavigationTheme(frameTheme);
    };
    // Native title updates can reset the navigation appearance. Apply ink after
    // that update, from the same owner, instead of racing page data callbacks.
    try {
      const result = Taro.setNavigationBarTitle?.({ title: nativeLabel });
      void Promise.resolve(result).then(applyColor, applyColor);
    } catch {
      applyColor();
    }
    return () => { active = false; };
  }, [nativeLabel, frameTheme]);
  const wasLocked = useRef(false);
  const frozenOffset = useRef(0);
  if (scrollLocked && !wasLocked.current)
    frozenOffset.current = Math.max(0, scrollOffset);
  const restoreOffset =
    !scrollLocked && wasLocked.current ? `${frozenOffset.current}px` : "";
  useEffect(() => {
    wasLocked.current = scrollLocked;
  }, [scrollLocked]);
  return (
    <FrameTheme.Provider value={frameTheme}>
    <FrameAccent.Provider value={accentColor || null}>
      <PageMeta
        scrollTop={restoreOffset}
        scrollDuration={0}
        pageStyle={
          scrollLocked
            ? "overflow:hidden;"
            : ""
        }
      />
      <View
        className={`page-frame ${scrollLocked ? "page-frame-locked" : ""} ${className || ""}`}
        style={
          {
            ...metrics,
            ...paletteStyle(accentColor),
            ...(scrollLocked ? { top: `${-frozenOffset.current}px` } : {}),
            "--page-locked-offset": `${frozenOffset.current}px`,
          } as CSSProperties
        }
      >
        <View className="page-frame-status page-sticky" />
        <View className="page-frame-header page-sticky">
          {header}
          {title && <Text className="page-frame-title">{title}</Text>}
        </View>
        {children}
      </View>
    </FrameAccent.Provider>
    </FrameTheme.Provider>
  );
}
