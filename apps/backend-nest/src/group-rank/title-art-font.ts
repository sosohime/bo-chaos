import { readFile } from 'node:fs/promises';
import { TITLE_FONT_FILE } from './title-art-renderer';

let coverage: Promise<(code: number) => boolean> | undefined;

/** Check the bundled font's actual cmap, so unsupported characters never turn into tofu. */
export async function supportsTitle(name: string): Promise<boolean> {
  coverage ??= readFile(TITLE_FONT_FILE).then((font) => {
    let cmap = 0;
    for (let i = 0; i < font.readUInt16BE(4); i++) {
      const offset = 12 + i * 16;
      if (font.toString('ascii', offset, offset + 4) === 'cmap')
        cmap = font.readUInt32BE(offset + 8);
    }
    if (!cmap) throw new Error('Title font has no character map');
    let table4 = 0;
    let table12 = 0;
    for (let i = 0; i < font.readUInt16BE(cmap + 2); i++) {
      const table = cmap + font.readUInt32BE(cmap + 4 + i * 8 + 4);
      if (font.readUInt16BE(table) === 4) table4 = table;
      if (font.readUInt16BE(table) === 12) table12 = table;
    }
    return (code: number) => {
      if (table12) {
        let low = 0;
        let high = font.readUInt32BE(table12 + 12) - 1;
        while (low <= high) {
          const index = (low + high) >>> 1;
          const offset = table12 + 16 + index * 12;
          const start = font.readUInt32BE(offset);
          const end = font.readUInt32BE(offset + 4);
          if (code < start) high = index - 1;
          else if (code > end) low = index + 1;
          else return font.readUInt32BE(offset + 8) + code - start !== 0;
        }
        return false;
      }
      if (!table4 || code > 65535) return false;
      const count = font.readUInt16BE(table4 + 6) / 2;
      for (let i = 0; i < count; i++) {
        const end = font.readUInt16BE(table4 + 14 + i * 2);
        if (code > end) continue;
        const start = font.readUInt16BE(table4 + 16 + count * 2 + i * 2);
        if (code < start) return false;
        const delta = font.readInt16BE(table4 + 16 + count * 4 + i * 2);
        const rangeOffset = table4 + 16 + count * 6 + i * 2;
        const range = font.readUInt16BE(rangeOffset);
        if (!range) return ((code + delta) & 65535) !== 0;
        const glyph = font.readUInt16BE(
          rangeOffset + range + 2 * (code - start),
        );
        return glyph !== 0 && ((glyph + delta) & 65535) !== 0;
      }
      return false;
    };
  });
  const has = await coverage;
  return Array.from(name).every((char) => has(char.codePointAt(0)!));
}
