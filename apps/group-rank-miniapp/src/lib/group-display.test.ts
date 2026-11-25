import { afterEach, expect, it, vi } from "vitest";
import {
  clearGroupDisplayContext,
  currentGroupDisplayId,
  setGroupDisplayContext,
  subscribeGroupDisplay,
} from "./group-display";

afterEach(() => {
  clearGroupDisplayContext();
  vi.useRealTimers();
});
it("expires the display context without retaining the old group during replacement", () => {
  vi.useFakeTimers();
  const listener = vi.fn();
  const unsubscribe = subscribeGroupDisplay(listener);
  setGroupDisplayContext("group-A", Date.now() + 1000);
  expect(currentGroupDisplayId()).toBe("group-A");
  vi.advanceTimersByTime(500);
  setGroupDisplayContext("group-B", Date.now() + 2000);
  vi.advanceTimersByTime(500);
  expect(currentGroupDisplayId()).toBe("group-B");
  vi.advanceTimersByTime(1500);
  expect(currentGroupDisplayId()).toBe("");
  expect(listener).toHaveBeenCalledTimes(3);
  unsubscribe();
});
it("never accepts an absent, malformed or already expired display ID", () => {
  for (const value of [undefined, null, 123, "", "x".repeat(257)]) {
    setGroupDisplayContext(value, Date.now() + 1000);
    expect(currentGroupDisplayId()).toBe("");
  }
  setGroupDisplayContext("A", Date.now() - 1);
  expect(currentGroupDisplayId()).toBe("");
});
