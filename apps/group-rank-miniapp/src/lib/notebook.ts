import type { GroupRankBoardDto } from "@mono/types";
import type { EntryIntent } from "./entry";

export function groupHomeTarget(boards: GroupRankBoardDto[], intent: EntryIntent) {
  if (intent.kind !== "group-card" || !intent.boardId) return undefined;
  // The locator is only matched against the verified current group's directory.
  return boards.find((board) => board.id === intent.boardId)?.id;
}

export type PageDirection = -1 | 1;

export type SwipePoint = { x: number; y: number };


type TouchCoordinates = {
  clientX?: number;
  clientY?: number;
  pageX?: number;
  pageY?: number;
  x?: number;
  y?: number;
};

/** The native event and its simulated form may expose different coordinate pairs. */
export function touchPoint(touch?: TouchCoordinates): SwipePoint | undefined {
  if (!touch) return;
  for (const [x, y] of [
    [touch.clientX, touch.clientY],
    [touch.pageX, touch.pageY],
    [touch.x, touch.y],
  ]) {
    if (typeof x === "number" && typeof y === "number" && Number.isFinite(x) && Number.isFinite(y))
      return { x, y };
  }
}

export function swipeAxis(start: SwipePoint, point: SwipePoint) {
  const x = Math.abs(point.x - start.x);
  const y = Math.abs(point.y - start.y);
  if (Math.max(x, y) < 12) return undefined;
  return x > 1.3 * y ? "horizontal" : "vertical";
}

export function pageTurn(start: SwipePoint, end: SwipePoint): PageDirection | undefined {
  const distance = end.x - start.x;
  if (Math.abs(distance) < 40 || swipeAxis(start, end) !== "horizontal") return;
  return distance < 0 ? 1 : -1;
}

export const folio = (index: number) => String(index + 1).padStart(2, "0");
