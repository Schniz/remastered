import { createCookieSessionStorage } from "./CookieSessionStorage";
import { intoSessionStore } from "./SessionStore";

test("okay", async () => {
  const storage = createCookieSessionStorage({
    cookie: {
      name: "remastered_session",
      secret: "my-password",
    },
  });

  const emptySession = await intoSessionStore(storage);
  emptySession.set("framework", "Remastered");
  const sessionWithData = await intoSessionStore(
    storage,
    await emptySession.commit()
  );

  expect(sessionWithData.get("framework")).toEqual("Remastered");
});

test("flash session", async () => {
  const storage = createCookieSessionStorage({
    cookie: {
      name: "remastered_session",
      secret: "my-password",
    },
  });

  const newSession = await intoSessionStore(storage);
  newSession.flash("this is flash", "flash value");

  const secondSession = await intoSessionStore(
    storage,
    await newSession.commit()
  );
  expect(secondSession.get("this is flash")).toEqual("flash value");

  const thirdSession = await intoSessionStore(
    storage,
    await secondSession.commit()
  );
  expect(thirdSession.get("this is flash")).not.toBeDefined();
});
