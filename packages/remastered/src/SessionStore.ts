import { HttpRequest } from "./HttpTypes";

export type StoredSession<Value> = {
  flashedKeys: Set<string>;
  content: Map<string, Value>;
};

type FromHeaderResult<Value, Metadata> = [Metadata] extends [undefined]
  ? [Value] | [Value, Metadata]
  : [Value, Metadata];

/**
 * A session storage.
 *
 * @template Value The applicable values that can be stored using this storage
 * @template The metadata needed to be passed from the reading phase, in order to persist changed state.
 *           for instance, if you want to store the session ID somewhere and use it to persist the data
 *           to an external storage later on.
 */
export type SessionStorage<Value, Metadata = undefined> = {
  /**
   * Get a value from header, return the session storage (and optional metadata for updating)
   */
  fromHeader(
    header?: string
  ): Promise<FromHeaderResult<StoredSession<Value>, Metadata>>;
  toHeader(session: StoredSession<Value>, metadata: Metadata): Promise<string>;
};

export type SessionStore<Value> = {
  /**
   * Get a value for a specific key from the session
   */
  get(key: string): Value | undefined;

  /**
   * Set a permanent key/value pair in the session
   */
  set(key: string, value: Value): void;

  /**
   * Set a temporary value in the session that will be cleared in the next request
   */
  flash(key: string, value: Value): void;

  /**
   * Check if a key is present in the session
   */
  has(key: string): boolean;

  /**
   * Remove a value for a given key in the session
   */
  unset(key: string): void;

  /**
   * Persist the session, and get a `Set-Cookie` header back.
   */
  commit(): Promise<string>;
};

export async function intoSessionStore<Value, Metadata>(
  m: SessionStorage<Value, Metadata>,
  header?: string
): Promise<SessionStore<Value>> {
  const [{ content, flashedKeys }, metadata] = await m.fromHeader(header);
  const newFlashKeys = new Set<string>();

  return {
    get: (key) => content.get(key),
    set: (key, value) => content.set(key, value),
    has: (key) => content.has(key),
    flash: (key, value) => {
      content.set(key, value);
      newFlashKeys.add(key);
    },
    unset: (key) => content.delete(key),
    async commit() {
      const mapWithoutOldFlashKeys = new Map(content);
      for (const key of flashedKeys) {
        mapWithoutOldFlashKeys.delete(key);
      }

      return m.toHeader(
        {
          flashedKeys: newFlashKeys,
          content: mapWithoutOldFlashKeys,
        },
        metadata!
      );
    },
  };
}

/**
 * Creates a `getSession` function that takes a request
 * and returns a session, that can be reused in the context of the
 * request.
 *
 * This way, every route can get the session and add stuff to it, without
 * compromising the global context.
 */
export function createSessionStore<Value>(
  storage: SessionStorage<Value>,
  headerName = "cookie"
): (request: HttpRequest) => Promise<SessionStore<Value>> {
  const cache = new WeakMap<HttpRequest, Promise<SessionStore<Value>>>();

  return (request) => {
    if (cache.has(request)) {
      return cache.get(request)!;
    }

    const sessionStorage = intoSessionStore(
      storage,
      request.headers.get(headerName) ?? undefined
    );

    cache.set(request, sessionStorage);
    return sessionStorage;
  };
}
