import type { GroupRankBackgroundChoice } from '@mono/types';
import sharp = require('sharp');

const sizes = {
  cover: { width: 960, height: 320 },
  card: { width: 144, height: 144 },
};
export type BackgroundSlot = keyof typeof sizes;

export function backgroundRenditions(background: GroupRankBackgroundChoice) {
  const version = (slot: BackgroundSlot) => {
    const { x, y, zoom } = background[slot];
    return `1-${x},${y},${zoom}`;
  };
  return { cover: version('cover'), card: version('card') };
}

export function renderBackground(
  source: Buffer,
  background: GroupRankBackgroundChoice & { imageWidth: number; imageHeight: number },
  slot: BackgroundSlot,
) {
  const { imageWidth, imageHeight } = background;
  const target = sizes[slot];
  const { x, y, zoom } = background[slot];
  const scale = Math.max(target.width / imageWidth, target.height / imageHeight) * zoom;
  const width = Math.max(1, Math.min(imageWidth, Math.round(target.width / scale)));
  const height = Math.max(1, Math.min(imageHeight, Math.round(target.height / scale)));
  return sharp(source)
    .extract({
      left: Math.round((imageWidth - width) * x),
      top: Math.round((imageHeight - height) * y),
      width,
      height,
    })
    .resize({ ...target, fit: 'fill', withoutEnlargement: true })
    .jpeg({ quality: 76, mozjpeg: true })
    .toBuffer();
}
