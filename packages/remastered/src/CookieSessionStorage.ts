import type { SessionStore } from "./SessionStore";
import cookie, { CookieSerializeOptions } from "cookie";
import Cryptr from "cryptr";

type JsonObject = { [key: string]: Serializable };
type Serializable = JsonObject | Serializable[] | undefined | string | number;

export type CookieSessionStorage = SessionStore<Serializable>;

export function CookieSessionStorage(opts: {
  cookie: {
    name: string;
    secret: string;
    sameSite?: CookieSerializeOptions["sameSite"];
  };
}): (cookieHeader?: string) => Promise<CookieSessionStorage> {
  const cryptr = new Cryptr(opts.cookie.secret);

  return async (cookieHeader) => {
    const parsedCookies =
      cookieHeader &&
      (cookie.parse(cookieHeader)?.[opts.cookie.name] as string | undefined);
    const { content, flashKeys } = parseCookie(cryptr, parsedCookies);
    const newFlashKeys: string[] = [];

    return {
      get: (key) => content.get(key),
      set: (key, value) => content.set(key, value),
      has: (key) => content.has(key),
      flash: (key, value) => {
        content.set(key, value);
        newFlashKeys.push(key);
      },
      unset: (key) => content.delete(key),
      async commit() {
        const mapWithoutOldFlashKeys = new Map(content);
        for (const key of flashKeys) {
          mapWithoutOldFlashKeys.delete(key);
        }

        return cookie.serialize(
          opts.cookie.name,
          encrypt(cryptr, {
            content: mapWithoutOldFlashKeys,
            flashKeys: newFlashKeys,
          }),
          {
            sameSite: opts.cookie.sameSite,
          }
        );
      },
    };
  };
}

function encrypt(cryptr: Cryptr, session: StorableSession): string {
  const hex = cryptr.encrypt(JSON.stringify(toStoredSession(session)));
  const base64 = Buffer.from(hex, "hex").toString("base64");
  return base64;
}

function parseCookie(cryptr: Cryptr, cookieString?: string): StorableSession {
  if (!cookieString) {
    return {
      flashKeys: [],
      content: new Map(),
    };
  }

  try {
    const hex = Buffer.from(cookieString, "base64").toString("hex");
    const result = cryptr.decrypt(hex);
    const data = JSON.parse(result);
    return fromStoredSession(data);
  } catch (e) {
    return {
      flashKeys: [],
      content: new Map(),
    };
  }
}

type StorableSession = {
  flashKeys: string[];
  content: Map<string, Serializable>;
};

type StoredSession = {
  flashKeys: string[];
  content: [string, Serializable][];
};

function toStoredSession(sess: StorableSession): StoredSession {
  return { flashKeys: sess.flashKeys, content: [...sess.content] };
}

function fromStoredSession(sess: StoredSession): StorableSession {
  return { flashKeys: sess.flashKeys, content: new Map(sess.content) };
}
