import type { SessionStorage, StoredSession } from "./SessionStore";
import { withEncryptedCookies, CookieSettings } from "./CookieSessionStorage";

/**
 * A testing session storage
 *
 * `Value` is `unknown` here, because it is an in-memory storage
 * so we can practically store anything!
 *
 * Keep in mind that this is good for testing purposes...
 * It can lead to inconsistencies in production environments
 * and memory leaks.
 */
export function MemorySessionStorage(opts: {
  generateId(): string;
  cookie: CookieSettings;
}): SessionStorage<unknown, string> {
  type UserId = ReturnType<typeof opts["generateId"]>;
  const cache = new Map<UserId, StoredSession<unknown>>();

  return withEncryptedCookies({
    cookie: opts.cookie,
    storage: {
      async fromHeader(userId) {
        if (!userId || !cache.has(userId)) {
          const userId = opts.generateId();
          const session: StoredSession<unknown> = {
            content: new Map(),
            flashedKeys: new Set(),
          };
          cache.set(userId, session);
          return [session, userId];
        }

        const result = cache.get(userId)!;
        return [result, userId];
      },
      async toHeader(_session, userId) {
        return userId;
      },
    },
  });
}
