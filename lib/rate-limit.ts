const WINDOW_MS = 60 * 1000;
const MAX_ATTEMPTS = 10;

const store = new Map<string, { count: number; resetAt: number }>();

function getKey(identifier: string, action: string): string {
  return `${action}:${identifier}`;
}

export function checkAuthRateLimit(identifier: string, action: "signIn" | "signUp"): boolean {
  const key = getKey(identifier, action);
  const now = Date.now();
  const entry = store.get(key);

  if (!entry) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  entry.count += 1;
  if (entry.count > MAX_ATTEMPTS) {
    return false;
  }
  return true;
}

export function clearAuthRateLimit(identifier: string, action: "signIn" | "signUp"): void {
  store.delete(getKey(identifier, action));
}
