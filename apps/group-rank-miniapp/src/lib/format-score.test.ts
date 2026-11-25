import { expect, it } from "vitest";
import { formatScore } from "./format-score";

it.each([
  ["668.000", "668"],
  ["520.100", "520.1"],
  ["0.010", "0.01"],
  ["0.000", "0"],
  ["999999999.999", "999999999.999"],
  ["9007199254740993.001", "9007199254740993.001"],
  ["1000", "1000"],
  ["—", "—"],
])("displays %s as %s without rounding", (input, expected) => {
  expect(formatScore(input)).toBe(expected);
});
