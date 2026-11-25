import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GroupRankBoardDto } from "@mono/types";
vi.mock("@tarojs/taro", () => ({ default: {} }));
import {
  consumeEntryNavigation,
  groupHomeTarget,
  needsEntryNavigation,
  resetEntryNavigation,
  resolveEntry,
} from "./entry";

const board = (id: string, status: "open" | "paused" | "closed" = "open") =>
  ({ id, status }) as GroupRankBoardDto;
const tools = resolveEntry({ scene: 1158 });
beforeEach(resetEntryNavigation);

describe("entry isolation and group home", () => {
  it.each([1001, 1005, 1011, 1089, 1007, 0])(
    "keeps normal/private/unknown scene %s in the lobby despite stale hints",
    (scene) => {
      const entry = resolveEntry({
        scene,
        query: {
          board: "A",
          template: "running-distance",
          group: "A",
          draft: "private-draft",
        },
      });
      expect(entry).toEqual({
        kind: "lobby",
        boardId: "",
        templateId: "",
        draftId: "",
      });
      expect(groupHomeTarget([board("A")], entry)).toBeUndefined();
    },
  );
  it.each([1008, 1044, 1160])(
    "recognizes group card/todo scene %s only as a request for verification",
    (scene) => {
      expect(resolveEntry({ scene, query: { board: "A" } }).kind).toBe(
        "group-card",
      );
      expect(resolveEntry({ scene, chatType: 1 }).kind).toBe("lobby");
    },
  );
  it("ignores old activity query parameters in group tools", () => {
    const intent = resolveEntry({
      scene: 1158,
      query: { board: "old", template: "old-template", draft: "old-draft" },
    });
    expect(intent).toEqual(tools);
    expect(
      groupHomeTarget([board("new"), board("old", "closed")], intent),
    ).toBeUndefined();
  });
  it("opens the exact shared activity even if other boards use the same template", () => {
    const intent = resolveEntry({ scene: 1044, query: { board: "second" } });
    expect(
      groupHomeTarget([board("first"), board("second", "closed")], intent),
    ).toBe("second");
  });
  it("does not open a source-group board or an unrelated destination board on cross-group forwarding", () => {
    const intent = resolveEntry({
      scene: 1044,
      query: { board: "A", template: "running-distance" },
    });
    expect(groupHomeTarget([board("B")], intent)).toBeUndefined();
    expect(groupHomeTarget([], intent)).toBeUndefined();
  });
  it("preserves a new-play suggestion instead of automatically opening an unrelated board", () => {
    expect(
      groupHomeTarget(
        [board("B")],
        resolveEntry({ scene: 1044, query: { template: "pull-ups" } }),
      ),
    ).toBeUndefined();
  });
  it("keeps the directory for group tools even with a sole running board", () => {
    expect(
      groupHomeTarget([board("open"), board("pause", "paused")], tools),
    ).toBeUndefined();
    expect(groupHomeTarget([board("a"), board("b")], tools)).toBeUndefined();
    expect(
      groupHomeTarget([board("a", "paused"), board("b", "closed")], tools),
    ).toBeUndefined();
    expect(groupHomeTarget([], tools)).toBeUndefined();
  });
  it("resolves each foreground once and does not redirect when returning to the group list", () => {
    expect(needsEntryNavigation()).toBe(true);
    expect(consumeEntryNavigation()).toBe(true);
    expect(needsEntryNavigation()).toBe(false);
    expect(consumeEntryNavigation()).toBe(false);
    resetEntryNavigation();
    expect(consumeEntryNavigation()).toBe(true);
  });
});

it("keeps draft suggestions from opening unrelated sole boards", () => {
  const entry = resolveEntry({ scene: 1044, query: { draft: "rules" } });
  expect(entry.draftId).toBe("rules");
  expect(groupHomeTarget([board("other")], entry)).toBeUndefined();
  expect(groupHomeTarget([board("same")], { ...entry, boardId: "same" })).toBe(
    "same",
  );
});
