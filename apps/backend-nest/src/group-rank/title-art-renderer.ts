import sharp = require('sharp');
import { resolve } from 'node:path';
import { openSync, type Font } from 'fontkit';

export const TITLE_ART_VERSION = 'electric-edge-v4';
export const TITLE_FONT_FILE = resolve(
  __dirname,
  '../../assets/group-rank/SmileySans-Oblique.ttf',
);
let face: Font | undefined;

/** Draw the pinned font's actual outlines, independent of installed system fonts. */
function glyphSvg(name: string, role: "board" | "banner"): string {
  face ??= openSync(TITLE_FONT_FILE) as Font;
  const characters = Array.from(name);
  if (
    !characters.length ||
    characters.length > 24 ||
    !name.trim() ||
    /[\p{Cc}\p{Cf}]/u.test(name)
  )
    throw new Error('Invalid title length or characters');
  if (
    characters.some(
      (character) => !face!.hasGlyphForCodePoint(character.codePointAt(0)!),
    )
  )
    throw new Error('Unsupported title glyph');
  const limit = 12;
  const lineCount = Math.ceil(characters.length / limit);
  const perLine = Math.ceil(characters.length / lineCount);
  const scale = 260 / face.unitsPerEm;
  const widthScale = scale * (role === "banner" ? 1.28 : 1.8);
  const lines: {
    paths: string;
    minX: number;
    maxY: number;
    width: number;
    height: number;
  }[] = [];
  for (let i = 0; i < characters.length; i += perLine) {
    const run = face.layout(characters.slice(i, i + perLine).join(''));
    let penX = 0,
      penY = 0,
      minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    const paths: string[] = [];
    run.glyphs.forEach((glyph, index) => {
      const position = run.positions[index];
      const x = penX + position.xOffset,
        y = penY + position.yOffset;
      const path = glyph.path.toSVG();
      if (path) {
        const box = glyph.bbox;
        minX = Math.min(minX, x + box.minX);
        maxX = Math.max(maxX, x + box.maxX);
        minY = Math.min(minY, y + box.minY);
        maxY = Math.max(maxY, y + box.maxY);
        paths.push(`<path d="${path}" transform="translate(${x},${y})"/>`);
      }
      penX += position.xAdvance;
      penY += position.yAdvance;
    });
    if (!paths.length) throw new Error('Title has no visible glyphs');
    lines.push({
      paths: paths.join(''),
      minX,
      maxY,
      width: (maxX - minX) * widthScale,
      height: (maxY - minY) * scale,
    });
  }
  const width = Math.ceil(Math.max(...lines.map((line) => line.width)) + 24);
  const height = Math.ceil(
    lines.reduce((sum, line) => sum + line.height, 0) +
      20 * (lines.length - 1) +
      24,
  );
  let top = 12;
  const content = lines
    .map((line) => {
      const x = (width - line.width) / 2 - line.minX * widthScale;
      const y = top + line.maxY * scale;
      top += line.height + 20;
      return `<g fill="white" stroke="white" stroke-width="32" stroke-linejoin="miter" stroke-miterlimit="2" transform="translate(${x},${y}) scale(${widthScale},${-scale})">${line.paths}</g>`;
    })
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${content}</svg>`;
}

/** One deterministic renderer used by the API and the isolated design preview. */
export async function renderTitleArt(
  name: string,
  role: "board" | "banner" = "board",
): Promise<{ image: Buffer; width: number; height: number }> {
  const lineCount = Math.ceil(Array.from(name).length / 12);
    let glyphPipeline = sharp(Buffer.from(glyphSvg(name, role)))
        .trim()
        .resize({
        width: 930,
        height: lineCount === 1 ? 300 : 270 * lineCount,
        fit: 'inside',
    });
    if (role === "banner")
        glyphPipeline = glyphPipeline.affine([[1, -0.10], [0, 1]], { background: { r: 0, g: 0, b: 0, alpha: 0 } });
    const glyph = await glyphPipeline.png().toBuffer({ resolveWithObject: true });
    const width = 1024, height = glyph.info.height + 40, x = Math.round((width - glyph.info.width) / 2) - 5, y = 10;
    const faceStops = '<stop stop-color="#fff"/><stop offset=".40" stop-color="#fff"/><stop offset=".465" stop-color="#e8eeef"/><stop offset=".49" stop-color="#9caeb4"/><stop offset=".515" stop-color="#fcffff"/><stop offset=".91" stop-color="#fff"/><stop offset="1" stop-color="#d3dfe2"/>';
    const depth = role === "banner" ? [3, 1, 0] : [4, 2, 0];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}"><defs>
 <image id="glyph" x="${x}" y="${y}" width="${glyph.info.width}" height="${glyph.info.height}" xlink:href="data:image/png;base64,${glyph.data.toString('base64')}"/>
 <filter id="spread" x="-10%" y="-15%" width="125%" height="145%"><feMorphology in="SourceAlpha" operator="dilate" radius="2.4"/><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"/></filter>
 <mask id="rim"><use xlink:href="#glyph" filter="url(#spread)"/></mask><mask id="face"><use xlink:href="#glyph"/></mask>
 <filter id="highlight" x="-10%" y="-10%" width="120%" height="130%"><feOffset in="SourceAlpha" dx="1.6" dy="1.2" result="shift"/><feComposite in="SourceAlpha" in2="shift" operator="out"/><feGaussianBlur stdDeviation=".5"/><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"/></filter>
 <filter id="inner-shadow" x="-10%" y="-10%" width="120%" height="130%"><feOffset in="SourceAlpha" dx="-1.6" dy="-1.2" result="shift"/><feComposite in="SourceAlpha" in2="shift" operator="out"/><feGaussianBlur stdDeviation=".5"/><feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"/></filter>
 <mask id="light"><use xlink:href="#glyph" filter="url(#highlight)"/></mask><mask id="shade"><use xlink:href="#glyph" filter="url(#inner-shadow)"/></mask>
 <linearGradient id="side" x1="0" y1="0" x2=".25" y2="1"><stop stop-color="#e1e7e8"/><stop offset=".35" stop-color="#4c6167"/><stop offset=".65" stop-color="#bdcbd0"/><stop offset="1" stop-color="#182830"/></linearGradient>
 <linearGradient id="porcelain" x1="0" y1="0" x2=".1" y2="1">${faceStops}</linearGradient>
 <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".28" numOctaves="3" seed="23"/><feColorMatrix type="saturate" values="0"/></filter>
 </defs>
 <rect width="${width}" height="${height}" fill="#101a27" mask="url(#rim)" transform="translate(2.5,5.5)" opacity=".35"/>
 ${depth.map((d) => `<rect width="${width}" height="${height}" fill="url(#side)" mask="url(#rim)" transform="translate(${d * 0.4},${d})"/>`).join('')}
 <rect width="${width}" height="${height}" fill="url(#porcelain)" mask="url(#face)"/>
 <g mask="url(#face)"><rect width="${width}" height="${height}" filter="url(#grain)" opacity=".025"/></g>
 <rect width="${width}" height="${height}" fill="#ffffff" mask="url(#light)" opacity=".65"/>
 <rect width="${width}" height="${height}" fill="#31434f" mask="url(#shade)" opacity=".32"/>
 </svg>`;
    const result = await sharp(Buffer.from(svg)).trim({ threshold: 0 })
        .extend({ top: 8, bottom: 8, left: 8, right: 8, background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png().toBuffer({ resolveWithObject: true });
    return { image: result.data, width: result.info.width, height: result.info.height };
}
