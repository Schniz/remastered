import { createSessionStore, createCookieSessionStorage } from "remastered";

export const getSession = createSessionStore(
  createCookieSessionStorage({
    cookie: {
      name: "_session",
      secret: "my-secret",
      sameSite: "lax",
      path: "/",
    },
  })
);
