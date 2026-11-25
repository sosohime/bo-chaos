import type { GroupRankCrop } from "@mono/types";
export const centeredCrop = (): GroupRankCrop => ({ x: 0.5, y: 0.5, zoom: 1 });
export type CropPoint = { x: number; y: number };
type Size = { width: number; height: number };
export function cropGeometry(
  iw: number,
  ih: number,
  vw: number,
  vh: number,
  crop: GroupRankCrop,
) {
  const scale =
    Math.max(vw / Math.max(1, iw), vh / Math.max(1, ih)) *
    Math.max(1, Math.min(2, crop.zoom));
  const width = iw * scale,
    height = ih * scale;
  return {
    width,
    height,
    left: -(width - vw) * Math.max(0, Math.min(1, crop.x)),
    top: -(height - vh) * Math.max(0, Math.min(1, crop.y)),
    travelX: width - vw,
    travelY: height - vh,
  };
}
export function dragCrop(
  crop: GroupRankCrop,
  dx: number,
  dy: number,
  travelX: number,
  travelY: number,
): GroupRankCrop {
  return {
    ...crop,
    x: travelX > 0 ? Math.max(0, Math.min(1, crop.x - dx / travelX)) : 0.5,
    y: travelY > 0 ? Math.max(0, Math.min(1, crop.y - dy / travelY)) : 0.5,
  };
}

export function pinchCrop(
  crop: GroupRankCrop,
  image: Size,
  viewport: Size,
  from: CropPoint,
  to: CropPoint,
  scale: number,
): GroupRankCrop {
  const zoom = Math.max(1, Math.min(2, crop.zoom * scale));
  const old = cropGeometry(image.width, image.height, viewport.width, viewport.height, crop);
  const next = cropGeometry(image.width, image.height, viewport.width, viewport.height, { ...crop, zoom });
  const offsetX = to.x - (from.x - old.left) * (next.width / old.width);
  const offsetY = to.y - (from.y - old.top) * (next.height / old.height);
  return dragCrop({ x: 0, y: 0, zoom }, offsetX, offsetY, next.travelX, next.travelY);
}

/** WeChat reports raw photo dimensions; Image and the server decoder honor EXIF rotation. */
export function orientedImageSize(
  width: number,
  height: number,
  orientation?: string,
) {
  return /^(left|right)(-mirrored)?$/.test(orientation || "")
    ? { width: height, height: width }
    : { width, height };
}
