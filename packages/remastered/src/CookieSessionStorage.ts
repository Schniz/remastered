import type {
  SessionStorage,
  SessionStore,
  StoredSession,
} from "./SessionStore";
import cookie, { CookieSerializeOptions } from "cookie";
import Cryptr from "cryptr";

type JsonObject = { [key: string]: Serializable };
type Serializable = JsonObject | Serializable[] | undefined | string | number;

export type CookieSessionStorage = SessionStore<Serializable>;

export type CookieSettings = {
  name: string;
  secret: string;
} & Partial<
  Pick<
    CookieSerializeOptions,
    "httpOnly" | "path" | "domain" | "secure" | "maxAge" | "sameSite"
  >
>;

export function createCookieSessionStorage(opts: {
  cookie: CookieSettings;
}): SessionStorage<Serializable> {
  return withEncryptedCookies({
    cookie: opts.cookie,
    storage: {
      async fromHeader(header) {
        if (!header) {
          return [
            {
              flashedKeys: new Set(),
              content: new Map(),
            },
          ];
        }

        try {
          const data = JSON.parse(header);
          return [deserialize(data)];
        } catch (e) {
          return [
            {
              flashedKeys: new Set(),
              content: new Map(),
            },
          ];
        }
      },
      async toHeader(session) {
        return JSON.stringify(serialize(session));
      },
    },
  });
}

type SerializableSession = {
  flashedKeys: string[];
  content: [string, Serializable][];
};

function serialize(sess: StoredSession<Serializable>): SerializableSession {
  return { flashedKeys: [...sess.flashedKeys], content: [...sess.content] };
}

function deserialize(sess: SerializableSession): StoredSession<Serializable> {
  return {
    flashedKeys: new Set(sess.flashedKeys),
    content: new Map(sess.content),
  };
}

/**
 * Turns a SessionStorage<Value> into a SessionStorage<Value> that
 * works with encrypted cookies.
 *
 * * the input in `fromHeader(header)` will become the encrypted cookie
 * * the output from `toHeader(session)` will be encrypted and stored in the cookie
 */
export function withEncryptedCookies<Value, Metadata>(opts: {
  storage: SessionStorage<Value, Metadata>;
  cookie: CookieSettings;
}): SessionStorage<Value, Metadata> {
  const { name, secret, ...cookieOptions } = opts.cookie;
  const cryptr = new Cryptr(secret);

  return {
    async fromHeader(header) {
      const parsedCookie =
        header &&
        (cookie.parse(header)?.[opts.cookie.name] as string | undefined);

      if (!parsedCookie) {
        return opts.storage.fromHeader(undefined);
      }

      let encryptedHeader: string | undefined;
      try {
        const hex = Buffer.from(parsedCookie, "base64").toString("hex");
        encryptedHeader = cryptr.decrypt(hex);
      } catch (e) {
        encryptedHeader = undefined;
      }

      return opts.storage.fromHeader(encryptedHeader);
    },
    async toHeader(givenSession, metadata) {
      const session = await opts.storage.toHeader(givenSession, metadata);
      const hex = cryptr.encrypt(session);
      const encryptedBase64 = Buffer.from(hex, "hex").toString("base64");

      return cookie.serialize(opts.cookie.name, encryptedBase64, {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        secure: true,
        maxAge: 60 * 60,
        ...cookieOptions,
      });
    },
  };
}
