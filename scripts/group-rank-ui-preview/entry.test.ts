import { expect, it } from "vitest";
import { previewEntryKind, previewNavigationQuery } from "./entry";

it("keeps ordinary launch context through create and back rather than inferring group from the destination page", () => {
  const create = previewNavigationQuery(new URLSearchParams("screen=lobby"), "/pages/create/index");
  expect(create.get("screen")).toBe("create");
  expect(previewEntryKind(create)).toBe("lobby");
  const back = previewNavigationQuery(create, "/pages/index/index");
  expect(back.get("screen")).toBe("lobby");
  expect(previewEntryKind(back)).toBe("lobby");
});

it("retains group context and only the new route identifiers across the group journey", () => {
  const create = previewNavigationQuery(new URLSearchParams("screen=group&id=stale&draft=old&case=championship"), "/pages/create/index?template=run");
  expect(create.get("entry")).toBe("group");
  expect(create.get("id")).toBeNull();
  expect(create.get("draft")).toBeNull();
  expect(create.get("template")).toBe("run");
  const board = previewNavigationQuery(create, "/pages/board/index?id=new");
  expect(board.get("screen")).toBe("board");
  expect(board.get("id")).toBe("new");
  expect(board.get("template")).toBeNull();
  expect(board.get("case")).toBe("championship");
  expect(previewNavigationQuery(board, "/pages/index/index").get("screen")).toBe("group");
});
