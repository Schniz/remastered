export type SessionStore<Value> = {
  get(key: string): Value | undefined;
  set(key: string, value: Value): void;
  flash(key: string, value: Value): void;
  has(key: string): boolean;
  unset(key: string): void;
};
