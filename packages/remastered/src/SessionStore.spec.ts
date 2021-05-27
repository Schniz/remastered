import { createSessionStore } from "./SessionStore";
import { CookieSessionStorage } from "./CookieSessionStorage";
import { Request } from "node-fetch";

test("it returns cached results for requests", () => {
  const storage = CookieSessionStorage({
    cookie: { name: "session", secret: "secret!" },
  });
  const request = new Request("/hello-world");
  const getSession = createSessionStore(storage);
  const req1 = getSession(request as any);
  const req2 = getSession(request as any);

  expect(req1).toBe(req2);
});
