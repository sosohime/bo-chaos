/** Display fixed-precision API decimals without adding visual precision or rounding. */
export function formatScore(value: string): string {
  if (!/^-?\d+\.\d+$/.test(value)) return value;
  return value.replace(/0+$/, "").replace(/\.$/, "");
}
