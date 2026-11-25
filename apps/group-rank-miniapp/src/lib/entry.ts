import Taro from "@tarojs/taro";
export { groupHomeTarget } from "./notebook";

export interface EntryOptions {
  scene?: number;
  chatType?: number;
  query?: Record<string, unknown>;
}

export type EntryIntent = {
  kind: "lobby" | "group-card" | "group-tool";
  boardId: string;
  templateId: string;
  draftId: string;
  personalResult?: boolean;
};

function hint(value: unknown) {
  return typeof value === "string" && value.length <= 160 ? value : "";
}

// Scene is only a routing hint. Every group read still needs server-verified proof.
export function resolveEntry(options: EntryOptions): EntryIntent {
  const { scene, chatType } = options;
  const isGroup =
    (chatType == null || chatType === 3) &&
    [1008, 1044, 1158, 1160].includes(scene || 0);
  if (!isGroup)
    return { kind: "lobby", boardId: "", templateId: "", draftId: "" };
  if (scene === 1158) {
    // Group tools may retain a previous activity's path/query. Always open the group home.
    return { kind: "group-tool", boardId: "", templateId: "", draftId: "" };
  }
  const personalResult = options.query?.result === "1";
  return {
    kind: "group-card",
    boardId: hint(options.query?.board),
    templateId: personalResult ? "" : hint(options.query?.template),
    draftId: personalResult ? "" : hint(options.query?.draft),
    ...(personalResult ? { personalResult: true } : {}),
  };
}

export function currentEntry() {
  return resolveEntry(Taro.getEnterOptionsSync());
}

let pendingNavigation = true;
export function resetEntryNavigation() {
  pendingNavigation = true;
}
export function needsEntryNavigation() {
  return pendingNavigation;
}
export function consumeEntryNavigation() {
  const pending = pendingNavigation;
  pendingNavigation = false;
  return pending;
}
