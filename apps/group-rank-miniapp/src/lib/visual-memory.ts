// The already-painted visual is reused when the preview becomes the current page.
// Group generations and asset versions are part of the caller's identity.
export function createVisualMemory<T>(limit: number) {
  let generation: number | undefined;
  const values = new Map<string, T>();
  return {
    get(session: number, key: string) {
      return session === generation ? values.get(key) : undefined;
    },
    set(session: number, key: string, value: T) {
      if (session !== generation) {
        values.clear();
        generation = session;
      }
      values.delete(key);
      values.set(key, value);
      if (values.size > limit) {
        const first = values.keys().next().value;
        if (first !== undefined) values.delete(first);
      }
    },
    delete(session: number, key: string) {
      if (session === generation) values.delete(key);
    },
  };
}
