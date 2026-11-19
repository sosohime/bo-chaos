import { afterEach, expect, it, vi } from "vitest";
import type { GroupRankBoardDetail } from "@mono/types";
import { createBoardWarmup } from "./board-warmup";

afterEach(() => vi.useRealTimers());

const board = (id: string) => ({ id }) as GroupRankBoardDetail;

it("uses a warm read once, with no extra requests on the foreground path", async () => {
  vi.useFakeTimers();
  const read = vi.fn(async (id: string) => board(id));
  const warmup = createBoardWarmup(read, () => 1);
  warmup.schedule(["next"]);
  await vi.advanceTimersByTimeAsync(250);
  expect((await warmup.read("next")).id).toBe("next");
  expect(read).toHaveBeenCalledTimes(1);
  await warmup.read("next");
  expect(read).toHaveBeenCalledTimes(2);
});

it("refetches expired or superseded group data", async () => {
  vi.useFakeTimers();
  let session = 1;
  const read = vi.fn(async (id: string) => board(id));
  const warmup = createBoardWarmup(read, () => session);
  warmup.schedule(["next"]);
  await vi.advanceTimersByTimeAsync(5300);
  await warmup.read("next");
  expect(read).toHaveBeenCalledTimes(2);
  warmup.schedule(["next"]);
  await vi.advanceTimersByTimeAsync(250);
  session += 1;
  await warmup.read("next");
  expect(read).toHaveBeenCalledTimes(4);
});

it("does not launch a second request when a selection beats the scheduled warmup", async () => {
  vi.useFakeTimers();
  const read = vi.fn(async (id: string) => board(id));
  const warmup = createBoardWarmup(read, () => 1);
  warmup.schedule(["next"]);
  await warmup.read("next");
  await vi.advanceTimersByTimeAsync(250);
  expect(read).toHaveBeenCalledTimes(1);
});
