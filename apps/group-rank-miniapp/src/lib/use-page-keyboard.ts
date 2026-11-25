import { useEffect, useRef, useState } from "react";
import Taro from "@tarojs/taro";
import { sheetViewportHeight } from "./sheet-viewport";

function windowHeight() {
  try { return Math.max(0, Taro.getWindowInfo?.()?.windowHeight || 0); }
  catch { return 0; }
}

/** Normal-page fixed actions need the same single-occlusion math as portal sheets. */
export function usePageKeyboard() {
  const [viewport, setViewport] = useState(() => ({ window: windowHeight(), keyboard: 0 }));
  const resting = useRef(viewport.window);
  const reset = () => {
    resting.current = windowHeight();
    setViewport({ window: resting.current, keyboard: 0 });
  };
  useEffect(() => {
    const keyboardChanged = ({ height }: { height: number }) => {
      const current = windowHeight();
      resting.current = Math.max(resting.current, current);
      setViewport({ window: current, keyboard: Number.isFinite(height) ? Math.max(0, height) : 0 });
    };
    const resized = ({ size }: { size: { windowHeight: number; windowWidth: number } }) => {
      resting.current = Math.max(resting.current, size.windowHeight);
      setViewport(previous => ({ ...previous, window: size.windowHeight }));
    };
    Taro.onKeyboardHeightChange?.(keyboardChanged);
    Taro.onWindowResize?.(resized);
    return () => {
      Taro.offKeyboardHeightChange?.(keyboardChanged);
      Taro.offWindowResize?.(resized as unknown as Parameters<typeof Taro.offWindowResize>[0]);
    };
  }, []);
  return {
    inset: Math.max(0, viewport.window - sheetViewportHeight(resting.current, viewport.window, viewport.keyboard)),
    open: viewport.keyboard > 0,
    reset,
  };
}
