import Taro from "@tarojs/taro";
import { useSyncExternalStore, type CSSProperties } from "react";

export const MAX_CANVAS_WIDTH = 500;
export function readViewport() {
  let width = 375, height = 0, status = 0, header = 54, clearance = 0;
  try {
    const info = Taro.getWindowInfo?.();
    if (Number.isFinite(info?.windowWidth) && info.windowWidth > 0) width = info.windowWidth;
    if (Number.isFinite(info?.windowHeight)) height = Math.max(0, info.windowHeight);
    if (typeof info?.statusBarHeight === "number" && Number.isFinite(info.statusBarHeight)) status = Math.max(0, info.statusBarHeight);
  } catch { /* A missing host API must not prevent rendering. */ }
  const canvas = Math.min(width, MAX_CANVAS_WIDTH), left = (width - canvas) / 2;
  header = Math.max(54, 45 * canvas / 375);
  try {
    const menu = Taro.getMenuButtonBoundingClientRect?.();
    if (menu?.height > 0 && menu.left > 0 && menu.left < width && Number.isFinite(menu.top) && Number.isFinite(menu.bottom)) {
      clearance = Math.max(0, left + canvas - menu.left) + 8;
      header = Math.max(44, menu.bottom - status + Math.max(0, menu.top - status));
    }
  } catch { /* Missing capsule metrics use the normal header. */ }
  return { width, height, canvas, left, status, header, clearance, scale: canvas / 375 };
}
type Viewport = ReturnType<typeof readViewport>;
let snapshot: Viewport | undefined;
function getSnapshot() {
  const next = readViewport();
  if (!snapshot || Object.keys(next).some(key => next[key as keyof Viewport] !== snapshot![key as keyof Viewport])) snapshot = next;
  return snapshot;
}
const listeners = new Set<() => void>();
const resized = () => { getSnapshot(); listeners.forEach(notify => notify()); };
function subscribe(notify: () => void) {
  if (!listeners.size) Taro.onWindowResize?.(resized);
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
    if (!listeners.size) Taro.offWindowResize?.(resized);
  };
}
export function useViewport() { return useSyncExternalStore(subscribe, getSnapshot, getSnapshot); }
export function viewportStyle(value = readViewport()) {
  return {
    "--ui-unit": `${value.scale}px`,
    "--canvas-width": `${value.canvas}px`,
    "--frame-left": `${value.left}px`,
    "--page-status-height": `${value.status}px`,
    "--page-header-height": `${value.header}px`,
    "--page-capsule-clearance": `${value.clearance}px`,
  } as CSSProperties;
}
