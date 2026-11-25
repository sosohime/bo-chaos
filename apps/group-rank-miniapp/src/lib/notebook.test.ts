import { describe, expect, it } from "vitest";
import { folio, pageTurn, swipeAxis, touchPoint } from "./notebook";

describe("notebook navigation gestures", () => {
  const start = { x: 120, y: 100 };

  it("counts a deliberate sweep in either direction", () => {
    expect(pageTurn(start, { x: 60, y: 112 })).toBe(1);
    expect(pageTurn(start, { x: 183, y: 98 })).toBe(-1);
  });

  it("leaves vertical and diagonal gestures in the current ranking", () => {
    expect(swipeAxis(start, { x: 112, y: 116 })).toBe("vertical");
    expect(pageTurn(start, { x: 38, y: 183 })).toBeUndefined();
  });

  it("ignores taps and short pointer movement", () => {
    expect(swipeAxis(start, { x: 111, y: 108 })).toBeUndefined();
    expect(pageTurn(start, { x: 83, y: 102 })).toBeUndefined();
  });

  it("numbers all pages including a large directory", () => {
    expect([0, 8, 9, 99].map(folio)).toEqual(["01", "09", "10", "100"]);
  });
});


it("normalizes native page coordinates and ignores invalid samples", () => {
  expect(touchPoint({ clientX: 0, clientY: 12, pageX: 30, pageY: 40 })).toEqual({ x: 0, y: 12 });
  expect(touchPoint({ pageX: 20, pageY: 30 })).toEqual({ x: 20, y: 30 });
  expect(touchPoint({ x: 25, y: 35 })).toEqual({ x: 25, y: 35 });
  expect(touchPoint({ clientX: NaN, clientY: 30 })).toBeUndefined();
});
