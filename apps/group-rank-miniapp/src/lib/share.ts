import { prepareShareArt } from "./share-art";
import { formatScore } from "./format-score";
import type { GroupRankBoardDetail, GroupRankTemplate } from "@mono/types";

// Incoming query values are suggestions only; the public template list is authoritative.
export function findSharedTemplate(
  templates: GroupRankTemplate[],
  candidate: string,
) {
  return templates.find((template) => template.id === candidate);
}

const HOME_PATH = "/pages/index/index";
export const SHARE_COVER_IMAGE = "/assets/share-cover.jpg";

const SHARE_TITLES = {
  home: "每群一小本 · 从群聊打开",
  rules: "打开卡片，在群里建榜单",
  board: "打开群里的榜单",
};

function rulePath(key: "draft" | "template", id: string) {
  return `${HOME_PATH}?${key}=${encodeURIComponent(id)}`;
}

function shareCard(kind: keyof typeof SHARE_TITLES, path: string) {
  return { title: SHARE_TITLES[kind], path, imageUrl: SHARE_COVER_IMAGE };
}

export function notebookShareCard() {
  return shareCard("home", HOME_PATH);
}

export function rulesShareCard(key: "draft" | "template", id: string) {
  return shareCard("rules", rulePath(key, id));
}

export const RANK_SHARE_KIND = "own-rank";
export const SCORE_SHARE_KIND = "own-score";
type PersonalShare = typeof RANK_SHARE_KIND | typeof SCORE_SHARE_KIND;

function ownShareRow(board?: GroupRankBoardDetail | null) {
  return board?.ranking.find((row) => row.userId === board.myUserId && !row.pendingClaim && Number.isSafeInteger(row.rank) && row.rank > 0);
}

export function ownRankShareTitle(board?: GroupRankBoardDetail | null) {
  const row = ownShareRow(board);
  if (row && board) return `我排第 ${row.rank} 名｜${board.template.name}`;
}

export function shareSelection(event?: { from?: string; target?: object }, menuScore = false): PersonalShare | undefined {
  if (event?.from === "menu" && menuScore) return SCORE_SHARE_KIND;
  if (event?.from !== "button") return;
  const kind = (event.target as { dataset?: { shareKind?: string } } | undefined)?.dataset?.shareKind;
  if (kind === RANK_SHARE_KIND || kind === SCORE_SHARE_KIND) return kind;
}

// The score and rank are a snapshot on the card, never in the entry URL.
export function boardShareCard(board?: GroupRankBoardDetail | null, selection?: PersonalShare) {
  if (!board) return notebookShareCard();
  const row = selection ? ownShareRow(board) : undefined;
  const base = board.draftId ? rulePath("draft", board.draftId) : rulePath("template", board.template.id);
  const path = row ? `${HOME_PATH}?board=${encodeURIComponent(board.id)}&result=1` : `${base}&board=${encodeURIComponent(board.id)}`;
  const card = shareCard("board", path);
  const name = board.template.name?.trim();
  return { ...card, title: row ? `我排第 ${row.rank} 名｜${name}` : name ? `${name}｜本群榜单` : card.title };
}

export function boardShareWithArt(board?: GroupRankBoardDetail | null, selection?: PersonalShare) {
  const card = boardShareCard(board, selection);
  const name = board?.template.name?.trim();
  if (!name || !board) return card;
  const row = selection ? ownShareRow(board) : undefined;
  const score = selection === SCORE_SHARE_KIND && row ? [formatScore(row.score), board.template.unit].filter(Boolean).join(" ") : undefined;
  const fallback = {
    ...card,
    title: score ? `${card.title} · ${score}` : card.title,
    imageUrl: row ? "/assets/arena/pixel-card-v4.jpg" : "/assets/arena/crystal-card-v3.jpg",
  };
  try {
    const image = prepareShareArt(name, row?.rank, score);
    const withImage = (imageUrl: string) => ({ ...fallback, imageUrl });
    return typeof image === "string"
      ? withImage(image)
      : { ...fallback, promise: image.then(withImage, () => fallback) };
  } catch {
    return fallback;
  }
}
