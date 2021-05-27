import { createSessionStore, CookieSessionStorage } from "remastered";

export const getSession = createSessionStore(
  CookieSessionStorage({
    cookie: {
      name: "_session",
      secret: "my-secret",
      sameSite: "lax",
      path: "/",
    },
  })
);
