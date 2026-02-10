const TTL_MS = 5 * 60 * 1000; // 5 minutos

type Entry<T> = { data: T; expires: number };

const memory = new Map<string, Entry<unknown>>();

export function getCached<T>(key: string): T | undefined {
  const entry = memory.get(key) as Entry<T> | undefined;
  if (!entry || Date.now() > entry.expires) {
    if (entry) memory.delete(key);
    return undefined;
  }
  return entry.data;
}

export function setCache<T>(key: string, data: T, ttlMs = TTL_MS): void {
  memory.set(key, { data, expires: Date.now() + ttlMs });
}

export function cacheKey(prefix: string, parts: Record<string, string>): string {
  const q = new URLSearchParams(parts).toString();
  return `${prefix}:${q}`;
}
