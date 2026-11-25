import { expect, it } from "vitest";
import { sheetViewportHeight, keyboardSheetLayout } from "./sheet-viewport";

it.each([
  [844, 844, 0, 844],
  [844, 844, 320, 524], // overlay keyboard
  [844, 524, 320, 524], // window already resized
  [844, 600, 320, 524], // resize event in flight
  [568, 568, 360, 208], // short phone, tall keyboard
  [844, 844, -20, 844],
])("fits keyboard occlusion once (%i/%i/%i)", (rest, current, keyboard, expected) => {
  expect(sheetViewportHeight(rest, current, keyboard)).toBe(expected);
});

it("leaves Close on the right for low sheets and reserves capsule space only near the top", () => {
  expect(keyboardSheetLayout(580, 390, 28, 280, 64).overlapsCapsule).toBe(false);
  expect(keyboardSheetLayout(520, 390, 28, 340, 64).overlapsCapsule).toBe(false);
  const short = keyboardSheetLayout(208, 320, 20, 340, 64);
  expect(short.overlapsCapsule).toBe(true);
  expect(short.height).toBeLessThan(208 - 20);
});
