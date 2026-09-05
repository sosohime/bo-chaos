export const DAY_MS = 86_400_000;

export function retirementSnapshot(target: number, start: number, now: number) {
  const remaining = Math.max(0, target - now);
  const seconds = Math.floor(remaining / 1000);
  const duration = target - start;
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor(seconds / 3600) % 24,
    minutes: Math.floor(seconds / 60) % 60,
    seconds: seconds % 60,
    progress:
      duration > 0
        ? Math.min(100, Math.max(0, ((now - start) / duration) * 100))
        : 100,
    reached: remaining === 0,
  };
}

export function countdownText(snapshot: ReturnType<typeof retirementSnapshot>) {
  return `${snapshot.days} 天 ${String(snapshot.hours).padStart(2, '0')}:${String(snapshot.minutes).padStart(2, '0')}:${String(snapshot.seconds).padStart(2, '0')}`;
}

export function shanghaiDate(ms: number) {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(ms);
}
