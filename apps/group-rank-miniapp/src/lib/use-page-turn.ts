import { useRef } from "react";
import type { ITouchEvent } from "@tarojs/components";
import {
  pageTurn,
  swipeAxis,
  touchPoint,
  type PageDirection,
  type SwipePoint,
} from "./notebook";

export function usePageTurn(
  locked: boolean,
  scrollOffset: { current: number },
  onTurn: (direction: PageDirection) => void,
) {
  const touch = useRef<{
    start: SwipePoint;
    last: SwipePoint;
    scrollTop: number;
    axis?: ReturnType<typeof swipeAxis>;
  } | null>(null);

  return {
    onTouchStart(event: unknown) {
      const { touches } = event as ITouchEvent;
      const point = touchPoint(touches?.[0]);
      touch.current = !locked && touches?.length === 1 && point
        ? { start: point, last: point, scrollTop: scrollOffset.current }
        : null;
    },
    onTouchMove(event: unknown) {
      const { touches } = event as ITouchEvent;
      if (locked || (touches?.length || 0) > 1) {
        touch.current = null;
        return;
      }
      const gesture = touch.current;
      const point = touchPoint(touches?.[0]);
      if (!gesture || !point) return;
      gesture.last = point;
      gesture.axis ??= swipeAxis(gesture.start, point);
    },
    onTouchEnd(event: unknown) {
      const { touches, changedTouches } = event as ITouchEvent;
      const gesture = touch.current;
      touch.current = null;
      if (locked || !gesture || gesture.axis === "vertical" || touches?.length
        || Math.abs(gesture.scrollTop - scrollOffset.current) > 12) return;
      const direction = pageTurn(gesture.start, touchPoint(changedTouches?.[0]) ?? gesture.last);
      if (direction) onTurn(direction);
    },
    onTouchCancel() { touch.current = null; },
  };
}
