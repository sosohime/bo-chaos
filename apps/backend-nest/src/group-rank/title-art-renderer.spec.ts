import sharp = require('sharp');
import { renderTitleArt, TITLE_ART_VERSION } from './title-art-renderer';
describe('real configurable electric lettering', () => {
  it.each(['王', '尿酸王', '这是一份用于验证二十四字标题完整排版的长名称'])(
    'renders actual glyphs with transparent uncropped edges: %s',
    async (name) => {
      const art = await renderTitleArt(name);
      expect(TITLE_ART_VERSION).toBe('electric-edge-v4');
      expect(art.width).toBeGreaterThan(0);
      expect(art.width).toBeLessThanOrEqual(1024);
      expect(art.height).toBeLessThan(800);
      const { data, info } = await sharp(art.image)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      let visible = 0,
        edge = 0;
      for (let y = 0; y < info.height; y++)
        for (let x = 0; x < info.width; x++) {
          const alpha = data[(y * info.width + x) * 4 + 3];
          if (alpha) visible++;
          if (
            x === 0 ||
            y === 0 ||
            x === info.width - 1 ||
            y === info.height - 1
          )
            edge += alpha;
        }
      expect(visible).toBeGreaterThan(1000);
      expect(edge).toBe(0);
    },
  );
  it('uses distinct bounded board and banner proportions and actual different names', async () => {
    const board = await renderTitleArt('尿酸王', 'board');
    const banner = await renderTitleArt('尿酸王', 'banner');
    const other = await renderTitleArt('今日步数');
    expect(board.width).toBeGreaterThan(0);
    expect(banner.height).toBeGreaterThan(0);
    expect(board.image.equals(banner.image)).toBe(false);
    expect(board.image.equals(other.image)).toBe(false);
    const {data} = await sharp(board.image).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    let ink=0;
    for(let i=0;i<data.length;i+=4) if(data[i+3]>200 && data[i]>230 && data[i+1]>230) ink++;
    expect(ink).toBeGreaterThan(1000);
  });
  it('rejects unsupported glyphs rather than drawing an unrelated title', async () => {
    await expect(renderTitleArt('🦄')).rejects.toThrow();
  });
});
