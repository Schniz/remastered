import { MemorySessionStorage } from "./MemorySessionStorage";
import { intoSessionStore } from "./SessionStore";

it("retrieves exact objects", async () => {
  const storage = MemorySessionStorage({
    cookie: {
      name: "_session",
      secret: "my-secret",
    },
    generateId() {
      return `user-${Math.round(Math.random() * 9999999)}`;
    },
  });

  const myObject = { hello: "world" };

  const session = await intoSessionStore(storage, "unknown-user");
  session.set("referenced object", myObject);

  const cookie = await session.commit();
  const secondSession = await intoSessionStore(storage, cookie);
  expect(secondSession.get("referenced object")).toBe(myObject);
});
