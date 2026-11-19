/** All dimensions are physical pixels returned by WeChat, never design pixels. */
export function sheetViewportHeight(restingHeight: number, windowHeight: number, keyboardHeight: number) {
  const rest = Math.max(0, restingHeight);
  const current = Math.max(0, windowHeight);
  const keyboard = Math.max(0, keyboardHeight);
  // Some Android hosts already resize the window. Apply keyboard occlusion once.
  return Math.max(0, Math.min(current, rest - keyboard));
}

/** Share this height with CSS so capsule avoidance applies only at its actual Y. */
export function keyboardSheetLayout(visible: number, width: number, status: number, preferred: number, capsuleBottom: number) {
  const scale = (width || 375) / 375;
  const height = Math.max(0, Math.min(preferred * scale, visible - status - 12 * scale));
  return { height, overlapsCapsule: visible - height < capsuleBottom };
}
