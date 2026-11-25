import { describe, expect, it, vi } from "vitest";
const runtime = vi.hoisted(() => ({ wx: {} as Record<string, unknown> }));
vi.mock("@tarojs/taro", () => ({ default: runtime.wx }));
import type { GroupRankBoardDetail, GroupRankTemplate } from "@mono/types";
import { boardShareCard, notebookShareCard, rulesShareCard, ownRankShareTitle, shareSelection, RANK_SHARE_KIND, SCORE_SHARE_KIND, boardShareWithArt, draftShareWithArt } from "./share";

const template = { id: "run/2026", name: "尿酸王" } as GroupRankTemplate;
const ranking = [
  { userId: "other", displayName: "其他群友", score: "668", rank: 1 },
  { userId: "me", displayName: "我的昵称", score: "520", rank: 2 },
];
const board: GroupRankBoardDetail = {
  id: "a&b", draftId: "saved rules/1", template, myUserId: "me",
  status: "open", creatorId: "other", ranking, myEntries: [],
  historyHasMore: false, historyNextCursor: null,
};

function query(path: string) {
  return Object.fromEntries(new URL(path, "https://example.invalid").searchParams);
}

describe("share cards", () => {
  it("uses the verified board name only in the normal board title", () => {
    const cards = [notebookShareCard(), rulesShareCard("template", template.id), boardShareCard(board)];
    expect(new Set(cards.map((card) => card.title)).size).toBe(3);
    expect(cards.every((card) => card.imageUrl === "/assets/share-cover.jpg")).toBe(true);
    expect(boardShareCard(null)).toEqual(cards[0]);
    expect(cards[2].title).toBe("尿酸王｜本群榜单");
    expect(query(cards[2].path)).toEqual({ draft: "saved rules/1", board: "a&b" });
    expect(query(boardShareCard({ ...board, draftId: null }).path)).toEqual({ template: "run/2026", board: "a&b" });
    expect(query(rulesShareCard("draft", "x?y").path)).toEqual({ draft: "x?y" });
  });

  it("shares only the owner's rank after an explicit rank button, with no scores or names", () => {
    const target = { dataset: { shareKind: "own-rank" } };
    expect(shareSelection({from:"menu", target})).toBeUndefined();
    expect(shareSelection({from:"menu"}, true)).toBe(SCORE_SHARE_KIND);
    expect(shareSelection({from:"button"})).toBeUndefined();
    const shared = boardShareCard(board, shareSelection({from:"button", target}));
    expect(shared.title).toBe("我排第 2 名｜尿酸王");
    expect(query(shared.path)).toEqual({ board: "a&b", result: "1" });
    expect(boardShareWithArt(board, SCORE_SHARE_KIND).title).toContain("520");
    expect(JSON.stringify(shared)).not.toMatch(/668|520|其他群友|我的昵称/);
    expect(ownRankShareTitle({ ...board, ranking: [ranking[0], { ...ranking[1], pendingClaim: true }] })).toBeUndefined();
    expect(boardShareCard({ ...board, ranking: [ranking[0]] }, RANK_SHARE_KIND).title).toBe("尿酸王｜本群榜单");
  });
});

it("keeps two different boards' share images separate when they are exported back to back", () => {
  const unrelated = "/test/avatar.png";
  const oldest = "/test/notebook-share-v2-100-0.png";
  const files = new Map<string, string>([[unrelated, "keep"]]);
  for (let index = 0; index < 23; index++) {
    files.set(`/test/notebook-share-v2-100-${index}.png`, "older share");
  }
  const noop = () => {};
  const fs = {
    writeFileSync: (path: string, payload: string) => { files.set(path, payload); },
    readdirSync: () => [...files.keys()].map(path => path.slice("/test/".length)),
    unlinkSync: (path: string) => { files.delete(path); },
  };
  Object.assign(runtime.wx, {
    env: { USER_DATA_PATH: "/test" },
    createOffscreenCanvas: () => {
      const labels: string[] = [];
      return {
        getContext: () => ({
          createLinearGradient: () => ({ addColorStop: noop }),
          fillRect: noop, beginPath: noop, moveTo: noop, lineTo: noop, stroke: noop, strokeRect: noop,
          fillText: (label: string) => { labels.push(label); },
          measureText: (value: string) => ({ width: value.length * 50 }),
        }),
        toDataURL: () => `data:image/png;base64,${Buffer.from(labels.join(" ")).toString("base64")}`,
      };
    },
    getFileSystemManager: () => fs,
  });
  try {
    const first = boardShareWithArt(board);
    const next = boardShareWithArt({
      ...board,
      id: "other-group-board",
      template: { ...template, name: "清微股东排行榜" },
    });
    expect(first.imageUrl).not.toBe(next.imageUrl);
    expect(Buffer.from(files.get(first.imageUrl)!, "base64").toString()).toContain("尿酸王");
    expect(Buffer.from(files.get(next.imageUrl)!, "base64").toString()).toContain("清微股东排行榜");
    expect(query(next.path).board).toBe("other-group-board");
    expect(files.get(unrelated)).toBe("keep");
    expect(files.has(oldest)).toBe(false);
    expect(files.size).toBe(25);
    const created = draftShareWithArt({
      id: "new-draft",
      template: { ...template, name: "新建好物榜" },
      expiresAt: "2026-11-30",
    });
    expect(created.title).toBe("新建好物榜｜在群里建榜");
    expect(created.imageUrl).not.toBe(first.imageUrl);
    expect(created.imageUrl).not.toBe(next.imageUrl);
    expect(Buffer.from(files.get(created.imageUrl)!, "base64").toString()).toContain("新建好物榜");
    expect(query(created.path)).toEqual({ draft: "new-draft" });
  } finally {
    for (const key of Object.keys(runtime.wx)) delete runtime.wx[key];
  }
});
