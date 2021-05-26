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
   * Persist the session, and get a `Set-Cookie` header back
   */
  commit(): Promise<string>;
};

export type SessionStoreFactory<Value> = (
  header?: string
) => Promise<SessionStore<Value>>;

/**
 * Creates a `getSession` function that takes a request
 * and returns a session, that can be reused in the context of the
 * request.
 *
 * This way, every route can get the session and add stuff to it, without
 * compromising the global context.
 */
export function createSessionStore<Store extends SessionStore<any>>(
  factory: (header?: string) => Promise<Store>,
  headerName = "cookie"
): (request: Request) => Promise<Store> {
  const cache = new WeakMap<Request, Promise<Store>>();

  return (request) => {
    if (cache.has(request)) {
      return cache.get(request)!;
    }

    const sessionStorage = factory(
      request.headers.get(headerName) ?? undefined
    );
    cache.set(request, sessionStorage);
    return sessionStorage;
  };
}
