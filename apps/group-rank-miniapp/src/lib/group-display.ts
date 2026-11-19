// An opaque, verified group ID for WeChat's private renderer, never a group name.
// This is memory-only and follows the current access session's lifetime.
let openGid = "";
let expiresAt = 0;
let revision = 0;
let expiry: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

export function currentGroupDisplayId() {
  return expiresAt > Date.now() ? openGid : "";
}

export function subscribeGroupDisplay(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setGroupDisplayContext(value: unknown, until: number) {
  const current = ++revision;
  if (expiry !== undefined) clearTimeout(expiry);
  expiry = undefined;
  const valid =
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 256 &&
    Number.isFinite(until) &&
    until > Date.now();
  openGid = valid ? value : "";
  expiresAt = valid ? until : 0;
  if (valid) {
    expiry = setTimeout(
      () => {
        if (revision === current) clearGroupDisplayContext();
      },
      Math.min(until - Date.now(), 2147483647),
    );
  }
  listeners.forEach((listener) => listener());
}

export function clearGroupDisplayContext() {
  setGroupDisplayContext("", 0);
}
