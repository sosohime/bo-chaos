import { describe, it, expect } from "vitest";
import {
  centeredCrop,
  cropGeometry,
  dragCrop,
  orientedImageSize,
} from "./background-crop";
describe("shared background crop geometry", () => {
  for (const [iw, ih] of [
    [1600, 400],
    [400, 1600],
    [800, 800],
  ])
    for (const width of [320, 375, 390, 430])
      for (const aspect of [2.8, 1])
        it(`covers ${iw}x${ih} at ${width}/${aspect} without stretching`, () => {
          const h = width / aspect;
          const r = cropGeometry(iw, ih, width, h, { x: 1, y: 0, zoom: 1.7 });
          expect(r.width / r.height).toBeCloseTo(iw / ih);
          expect(r.left).toBeCloseTo(width - r.width);
          expect(r.top).toBeCloseTo(0);
          expect(r.width).toBeGreaterThanOrEqual(width);
          expect(r.height).toBeGreaterThanOrEqual(h);
        });
  it("clamps drag, ignores motion on an axis with no travel, keeps slots independent", () => {
    const first = centeredCrop(),
      second = centeredCrop();
    expect(dragCrop(first, 500, -500, 100, 100)).toEqual({
      x: 0,
      y: 1,
      zoom: 1,
    });
    expect(dragCrop(first, 200, 200, 0, 0)).toEqual(first);
    expect(second).toEqual(centeredCrop());
  });
});

it("uses EXIF-oriented dimensions before uploading a portrait photo", () => {
  expect(orientedImageSize(1200, 800, "right")).toEqual({
    width: 800,
    height: 1200,
  });
  expect(orientedImageSize(1200, 800, "left-mirrored")).toEqual({
    width: 800,
    height: 1200,
  });
  expect(orientedImageSize(1200, 800, "down")).toEqual({
    width: 1200,
    height: 800,
  });
});
