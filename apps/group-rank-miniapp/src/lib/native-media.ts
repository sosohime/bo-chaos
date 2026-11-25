import Taro from "@tarojs/taro";

let selecting = 0;
let origin: string | null = null;
let originPage: string | null = null;
let hiddenDuringSelection = false;
let returnedFromSelection = false;
let foregroundEntry: string | null = null;
const nativeAvatarSelections = new Set<() => void>();

type MediaEntry = {
  scene?: number;
  path?: string;
  chatType?: number;
  shareTicket?: string;
  query?: Record<string, unknown>;
};

function entryKey(options?: MediaEntry) {
  try {
    const entry = options || Taro.getEnterOptionsSync();
    const query = (entry.query || {}) as Record<string, unknown>;
    return JSON.stringify([
      entry.scene, entry.path, entry.chatType, entry.shareTicket,
      Object.keys(query).sort().map((key) => [key, query[key]]),
    ]);
  } catch {
    return null;
  }
}

// DevTools may report the already-open internal page as the resume path/query.
// Capture that exact route before opening the picker; proof/scene stay part of the key.
function pageReturnKey(currentEntry = entryKey()) {
  try {
    const pages = Taro.getCurrentPages?.();
    const page = pages?.[pages.length - 1];
    if (!page?.route) return null;
    const entry = JSON.parse(currentEntry || "null");
    if (!entry) return null;
    const query = page.options || {};
    entry[1] = page.route.replace(/^\//, "");
    entry[4] = Object.keys(query).sort().map((key) => [key, query[key]]);
    return JSON.stringify(entry);
  } catch { return null; }
}

function isSamePageResume(incoming: string | null) {
  if (!originPage || !incoming || pageReturnKey(incoming) !== incoming) return false;
  if (originPage === incoming) return true;
  // WeChat can refresh a stale ordinary-entry scene to album-QR scene 1013
  // when returning to the already-open editor. Match its exact route/query,
  // chat type and proof; scene alone is not a new navigation in this case.
  const expected = JSON.parse(originPage);
  const resumed = JSON.parse(incoming);
  if (expected[0] !== 1001 || resumed[0] !== 1013) return false;
  expected[0] = resumed[0];
  return JSON.stringify(expected) === incoming;
}

/** Preserve the editor across the system album, never across a changed entry. */
function beginSelection() {
  // On a physical cold launch the synchronous API can still expose the previous
  // entry. The most recent App.onShow event owns this foreground's identity.
  if (!selecting) { origin = foregroundEntry || entryKey(); originPage = pageReturnKey(origin); }
  selecting += 1;
  let finished = false;
  return () => {
    if (finished) return;
    finished = true;
    selecting -= 1;
    if (!selecting && !hiddenDuringSelection) origin = null;
  };
}

export async function withNativeMedia<T>(operation: () => Promise<T>): Promise<T> {
  const finish = beginSelection();
  try { return await operation(); } finally { finish(); }
}

/** chooseAvatar has no cancellation callback; the matching foreground ends its selection. */
export function beginNativeAvatarSelection() {
  const finish = beginSelection();
  const release = () => { finish(); nativeAvatarSelections.delete(release); };
  nativeAvatarSelections.add(release);
  return release;
}

export function nativeMediaInProgress() {
  return selecting > 0;
}

export function nativeMediaAppHidden() {
  returnedFromSelection = false;
  hiddenDuringSelection = nativeMediaInProgress();
  if (!hiddenDuringSelection) origin = null;
}

export function nativeMediaAppShown(options?: MediaEntry) {
  const incoming = entryKey(options);
  returnedFromSelection = (nativeMediaInProgress() || hiddenDuringSelection)
    && origin !== null && (origin === incoming
      || isSamePageResume(incoming));
  foregroundEntry = incoming;
  for (const finish of [...nativeAvatarSelections]) finish();
  hiddenDuringSelection = false;
  if (!selecting) origin = null;
  return returnedFromSelection;
}

export function consumeNativeMediaReturn() {
  const returned = returnedFromSelection;
  returnedFromSelection = false;
  return returned;
}
