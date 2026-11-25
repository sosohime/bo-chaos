import { formatScore } from "./format-score";

type Person = { displayName: string; score: string; rank: number; pendingClaim?: boolean };
const units = (text: string) => Array.from(text).reduce((sum, ch) => sum + (/^[\x00-\x7f]$/.test(ch) ? .6 : 1), 0);
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
export const portraitProgress = (scrollTop: number, distance: number) => Math.min(1, Math.max(0, scrollTop / Math.max(1, distance)));

/** Physical coordinates share one owner with the zero-height sticky stage.
 *  The document spacer never changes during scroll; only this stage interpolates. */
export function portraitLayout(ranking: Person[], title: string, width = 375) {
  const rows = ranking.slice(0, 3);
  const scale = Math.min(430, Math.max(280, width)) / 375;
  const count = rows.length;
  const column = (375 - 32) * scale / Math.max(1, count);
  const header = Math.max(44, (Array.from(title).length > 12 ? 116 : Array.from(title).length > 6 ? 88 : 40) * scale);
  const nameFont = 15 * scale, nameLine = 18 * scale;
  const nameHeight = Math.max(1, ...rows.map(p => Math.ceil(units(p.displayName) * nameFont / (column - 8 * scale)))) * nameLine;
  const valueFont = rows.some(p => formatScore(p.score).length > 8) ? 16 * scale : 24 * scale;
  const valueHeight = Math.max(1, ...rows.map(p => Math.ceil(formatScore(p.score).length * valueFont * .6 / (column - 8 * scale)))) * 28 * scale;
  const actionHeight = rows.some(p => p.pendingClaim) ? 16 * scale : 0;
  const compactFont = Math.max(11, 12 * scale), compactValueFont = Math.max(12, (rows.some(p => formatScore(p.score).length > 8) ? 14 : 17) * scale);
  const compactPeople = rows.map(p => {
    const nameWidth = Math.min(column - 8 * scale, units(p.displayName) * compactFont + 2);
    const valueWidth = Math.min(column - 8 * scale, formatScore(p.score).length * compactValueFont * .6 + 2);
    const inline = nameWidth + valueWidth + 4 * scale <= column - 8 * scale;
    const compactNameHeight = Math.max(Math.ceil(units(p.displayName) * compactFont / (column - 8 * scale)) * 18 * scale, inline ? 18 * scale : nameHeight);
    const valueHeight = Math.ceil(formatScore(p.score).length * compactValueFont * .6 / (column - 8 * scale)) * 22 * scale;
    return { inline, nameWidth, valueWidth, nameHeight: compactNameHeight, valueHeight, height: inline ? 26 * scale : compactNameHeight + valueHeight };
  });
  const compact = count ? 64 * scale + Math.max(26 * scale, ...compactPeople.map(p => p.height)) + actionHeight + 4 * scale : header;
  const expanded = count ? Math.max(header + 112 * scale + nameHeight + valueHeight + actionHeight + 4 * scale, compact + 40 * scale) : header;
  const equal = count === 2 || rows.some((p, i) => rows.some((other, j) => i !== j && p.rank === other.rank));
  return { rows, count, scale, column, header, expanded, compact, nameFont, nameHeight, valueFont, valueHeight, actionHeight, compactFont, compactValueFont, compactPeople, equal };
}

export function portraitPose(layout: ReturnType<typeof portraitLayout>, index: number, progress: number) {
  const t = Math.min(1, Math.max(0, progress));
  const { scale: s, column, header, compactPeople } = layout;
  const small = compactPeople[index];
  const largePhoto = layout.equal ? 76 : index === 0 ? 84 : 68;
  const smallPhoto = layout.equal ? 36 : index === 0 ? 40 : 32;
  const compactPhotoTop = layout.equal ? 20 : index === 0 ? 13 : 24;
  const nameLeft = small.inline ? (column - small.nameWidth - small.valueWidth - 4 * s) / 2 : 4 * s;
  const valueLeft = small.inline ? nameLeft + small.nameWidth + 4 * s : 4 * s;
  const nameTop = small.inline ? 68 * s : 64 * s;
  const valueTop = small.inline ? 64 * s : 64 * s + small.nameHeight;
  const largeNameTop = header + 112 * s;
  // First reduce type while it has a full column, then move horizontally.
  // Only after the boxes are disjoint may the two baselines merge.
  const typeT = Math.min(1, t / .3);
  const horizontalT = Math.min(1, Math.max(0, (t - .3) / .35));
  const inlineT = Math.min(1, Math.max(0, (t - .65) / .35));
  const currentNameTop = mix(largeNameTop, nameTop, t);
  const currentNameHeight = Math.max(layout.nameHeight, small.nameHeight);
  const currentValueHeight = mix(Math.max(layout.valueHeight, small.valueHeight), small.valueHeight, inlineT);
  const currentValueTop = small.inline
    ? mix(currentNameTop + currentNameHeight, valueTop, inlineT)
    : currentNameTop + currentNameHeight;
  const currentActionTop = Math.max(currentValueTop + currentValueHeight, currentNameTop + currentNameHeight);
  const height = Math.max(mix(layout.expanded, layout.compact, t), currentActionTop + layout.actionHeight + 4 * s);

  return {
    height,
    photoTop: mix(header + (106 - largePhoto) * s, compactPhotoTop * s, t),
    photoSize: mix(largePhoto * s, smallPhoto * s, t),
    nameTop: currentNameTop,
    nameLeft: mix(4 * s, nameLeft, horizontalT),
    nameWidth: mix(column - 8 * s, small.inline ? small.nameWidth : column - 8 * s, horizontalT),
    nameFont: mix(layout.nameFont, layout.compactFont, typeT),
    nameHeight: currentNameHeight,
    valueTop: currentValueTop,
    valueLeft: mix(4 * s, valueLeft, horizontalT),
    valueWidth: mix(column - 8 * s, small.inline ? small.valueWidth : column - 8 * s, horizontalT),
    valueFont: mix(layout.valueFont, layout.compactValueFont, typeT),
    valueLine: (28 - 6 * typeT) * s,
    valueHeight: currentValueHeight,
    actionTop: currentActionTop,
    actionHeight: layout.actionHeight,
  };
}
