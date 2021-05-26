import { CookieSessionStorage } from "./CookieSessionStorage";

test("okay", async () => {
  const getSession = CookieSessionStorage({
    cookie: {
      name: "remastered_session",
      secret: "my-password",
    },
  });

  const emptySession = await getSession();
  emptySession.set("framework", "Remastered");
  const sessionWithData = await getSession(await emptySession.commit());

  expect(sessionWithData.get("framework")).toEqual("Remastered");
});

test("flash session", async () => {
  const getSession = CookieSessionStorage({
    cookie: {
      name: "remastered_session",
      secret: "my-password",
    },
  });

  const newSession = await getSession();
  newSession.flash("this is flash", "flash value");

  const secondSession = await getSession(await newSession.commit());
  expect(secondSession.get("this is flash")).toEqual("flash value");

  const thirdSession = await getSession(await secondSession.commit());
  expect(thirdSession.get("this is flash")).not.toBeDefined();
});
