/** Only the title band has a deliberate size. Ranking content owns its height. */
export function arenaLayout(title: string, width = 375) {
  const scale = width / 375;
  const length = Array.from(title).length;
  const header = Math.max(81, (length > 12 ? 104 : length > 6 ? 96 : 81) * scale);
  return { scale, header };
}
