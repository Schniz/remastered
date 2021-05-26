import { createCookieSessionStorage } from "./CookieSessionStorage";

test("okay", () => {
  const getSession = createCookieSessionStorage({
    cookie: {
      name: "remastered_session",
      secret: "my-password",
    },
  });

  const emptySession = getSession();
  emptySession.set("framework", "Remastered");

  expect(getSession(emptySession.commit()).get("framework")).toEqual(
    "Remastered"
  );
});

test("flash session", () => {
  const getSession = createCookieSessionStorage({
    cookie: {
      name: "remastered_session",
      secret: "my-password",
    },
  });

  const newSession = getSession();
  newSession.flash("this is flash", "flash value");

  const secondSession = getSession(newSession.commit());
  expect(secondSession.get("this is flash")).toEqual("flash value");

  const thirdSession = getSession(secondSession.commit());
  expect(thirdSession.get("this is flash")).not.toBeDefined();
});
