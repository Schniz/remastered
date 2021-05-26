---
title: Sessions
---

Sessions are an integral part of a web framework. This is how we "remember" things for our users. Remastered provides a framework to handle sessions in multiple ways:

- Cookie-based sessions
- _TODO_
- Do-it-yourself

The `remastered` package exports a `createSessionStore` function, which takes a session storage as its parameter and an optional `headerName` for overriding the header which will be passed to the storage.

We recommend putting the session store creation in a file, like `app/session.ts`, so you could reference it anytime.

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

> Note! you must `commit` the session when you read `flash` sessions in order for them to be removed from the session

## `commit(): Promise<string>`

Persists the session into the storage of choice and returns a `Set-Cookie` header to set in the response

# Session Storages

A session can be stored anywhere. Some apps are using cookies to persist sessions, while some apps are using their database or a Redis instance. There are different tradeoffs for every decisions. Remastered is built in a way that abstracts the underlying mechanism, so you can replace it anytime.

## Cookie-based sessions

Cookie-based session allows you to persist the entire session inside the request/response cookies. There are advantages for this method, as it does not require any persistent storage services like databases or caches like Redis — and works great in production.

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
