---
title: Sessions
---

Sessions are an integral part of a web framework. This is how we "remember" things for our users. Remastered provides a framework to handle sessions in multiple ways:

- Cookie-based sessions
- _TODO_
- Do-it-yourself

The `remastered` package exports a `createSessionStore` function, which takes a session storage as its parameter and an optional `headerName` for overriding the header which will be passed to the storage.

We recommend putting the session store creation in a single file, like `app/session.ts`, so you could reference it anytime and not pass around secrets.

# Session Store API

The session store API feels a lot like a native `Map`, but with some additions. Each session storage can allow storing different values (hence the generic `Value` in `SessionStore<Value>`), but all of the storages provided by Remastered support JSON-serializable formats.

## `has(key: string): boolean`

Checks whether a `key` exists in the session

## `get(key: string): Value`

Retrives the value of `key` from the session

## `unset(key: string): void`

Deletes a key from the session

## `set(key: string, value: Value): void`

Sets a persistent `value` linked as `key` in the session

## `flash(key: string, value: Value): void`

Sets a temporary `value` linked as `key` in the session.
This is mostly handy in situations like messages or notifications into a redirect:

> Note! you must `commit` the session when you read `flash` sessions in order for them to be removed from the session. This is different from frameworks like Ruby on Rails, which do that automatically for you.

## `commit(): Promise<string>`

Persists the session into the storage of choice and returns a `Set-Cookie` header to set in the response

# Session Storages

A session can be stored anywhere. Some apps are using cookies to persist sessions, while some apps are using their database or a Redis instance. There are different tradeoffs for every decisions. Remastered is built in a way that abstracts the underlying mechanism, so you can replace it anytime.

## Cookie-based sessions

Cookie-based session allows you to serialize the session into an encrypted [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies). There are advantages for this method, as it does not require any persistent storage services like databases or caches like Redis — and works great in production.

The main disadvantage is that cookies are usually maxed-out at 4kb, which means your session storage has a low budget.

You can set up a cookie session by using the `CookieSessionStorage`:

```ts
// app/sessions.ts
import { CookieSessionStorage, getSessionStore } from "remastered";

export const getSession = getSessionStore(
  CookieSessionStorage({
    cookie: {
      name: "session-cookie-name",
      secret: "a secret to encrypt the session contents",
    },
  })
);
```

## Implementing session storages

> Note: when implementing session storages, please follow the tips below for better security for your users.

We haven't implemented all the sessions possible. Let's say you want to implement a Redis session or a PostgreSQL session or whatever you want -- the API is very clear and well-typed. All you need is to implement a `SessionStorage<Value, Metadata>`.

The `SessionStorage<Value, Metadata>` is an interface that declares how to read and write sessions. In order to make it as type-safe as possible, it is a generic type. Its generics are:

- `Value` is the allowed value types for this storage. Not all storages will support any kind of data store.
  - When using `MemorySessionStorage`, that stores everything in-memory, _anything_ can be stored. You can store any kind of objects. This is why `MemorySessionStorage` has a `Value` of `unknown`.
  - When using `CookieSessionStorage`, that stores everything as a JSON string in the cookie header, you can only store JSON-serializable objects. This is why `CookieSessionStorage` has a `Value` of `Serializable`, which is a type that contains all the available JSON types.
- `Metadata` is a value that will be passed from the reading phase (`fromHeader`, more on this later) into the committing phase (`toHeader`). This is optional and will be `unknown` if not given. This is especially useful for storing session IDs or other data that should not be manipulated by the session itself in the application code, but helps updating and saving it to the storage layer later on.

Your storage will be managing a `StoredSession<Value>`, an object that contains a `content: Map<string, Value>` of data that can be consumed and altered by the application code by using `set`, `get`, `unset`, and `flash`. It also contains a `flashedKeys: Set<string>` which are the keys that needs to be removed after reading them in the next session commit.

In order to finally implement your session storage, you will need to provide an object with the following methods:

#### The reading phase: `fromHeader(header?: string): Promise<[StoredSession<Value>, Metadata]>`

The `fromHeader` function takes an optional header. A header can be a `Cookie` header or an `Authorization` header. It will be later defined by `createSessionStore`.

Your storage should take the optional `header`, and return a tuple of a `StoredSession<Value>` and `Metadata`. `StoredSession<Value>`.

#### The commit phase: `toHeader(content: StoredSession<Value>, metadata: Metadata): Promise<string>`

The `toHeader` function takes a `StoredSession<Value>` and a `Metadata` and stores it to the device, returning a string representation for the session. It can be a session ID, a JWT, or an entire cookie header. It's up to the storage implementation to decide.

### Tips for implementing session storages

1. Encrypt or cryptographically sign whatever you pass to the user. You don't want the users to alter the session ID and be able to read another user's details
2. If not encrypted, use some randomness and timestamps for generating session IDs
3. Expire your sessions. Don't let them live forever. The longer they live — the higher the risk of stealing them.
