import type { GroupRankBoardDetail } from "@mono/types";

const WARMUP_DELAY = 220;
const WARMUP_LIFETIME = 5_000;

export function createBoardWarmup(
  read: (id: string) => Promise<GroupRankBoardDetail>,
  generation: () => number,
) {
  const entries = new Map<string, {
    generation: number;
    requestedAt: number;
    detail: Promise<GroupRankBoardDetail | undefined>;
  }>();

  let scheduled = new Set<string>();

  function warm(ids: string[]) {
    const current = generation();
    for (const id of ids) {
      if (entries.has(id)) continue;
      const entry = {
        generation: current,
        requestedAt: Date.now(),
        detail: read(id).then(
          result => result.id === id ? result : undefined,
          () => undefined,
        ),
      };
      entries.set(id, entry);
    }
  }

  return {
    schedule(ids: string[], onReady?: (detail: GroupRankBoardDetail) => void) {
      let active = true;
      const session = generation();
      const wanted = new Set(ids);
      scheduled = wanted;
      for (const [id, entry] of entries) {
        if (!wanted.has(id) || entry.generation !== session || Date.now() - entry.requestedAt > WARMUP_LIFETIME)
          entries.delete(id);
      }
      const timer = setTimeout(() => {
        if (generation() !== session) return;
        warm([...wanted]);
        if (onReady) {
          for (const id of wanted) {
            void entries.get(id)?.detail.then(detail => {
              if (active && detail && generation() === session) onReady(detail);
            });
          }
        }
      }, WARMUP_DELAY);
      return () => {
        active = false;
        clearTimeout(timer);
      };
    },
    async read(id: string) {
      scheduled.delete(id);
      const entry = entries.get(id);
      entries.delete(id);
      const session = generation();
      if (entry?.generation === session && Date.now() - entry.requestedAt <= WARMUP_LIFETIME) {
        const detail = await entry.detail;
        if (generation() !== session) throw new Error("进入的群已变化，请重试");
        if (detail) return detail;
      }
      return read(id);
    },
    clear() { scheduled.clear(); entries.clear(); },
  };
}
