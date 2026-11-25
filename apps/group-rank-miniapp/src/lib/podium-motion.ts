/** Physical-pixel threshold measured from the two stable cover layouts. */
export function podiumCollapsed(previous: boolean, scrollTop: number, collapseAt = 89) {
  const threshold = Math.max(12, collapseAt);
  return previous ? scrollTop > threshold - 12 : scrollTop >= threshold;
}
