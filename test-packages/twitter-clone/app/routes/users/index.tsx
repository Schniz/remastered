import { ActionFn, redirectTo } from "remastered";
import { getSession } from "../../session";
import * as User from "../../models/User";

export const action: ActionFn = async ({ request }) => {
  const text = new URLSearchParams(await request.text());
  const user$ = parseUser({
    email: text.get("email"),
    password: text.get("password"),
    passwordConfirmation: text.get("password_confirmation"),
    displayName: text.get("name"),
  });
  const session = await getSession(request);
  if (user$._tag === "err") {
    session.set("errors", user$.error);
    return redirectTo("/users/new", {
      headers: {
        "Set-Cookie": await session.commit(),
      },
    });
  }

  const { email, password, displayName } = user$.value;
  const user = await User.signUp({
    email,
    plaintextPassword: password,
    displayName,
  });
  session.set("userId", user.id);
  session.flash("notice", "Successfuly registered!");
  return redirectTo(`/users/${user.id}`, {
    headers: {
      "Set-Cookie": await session.commit(),
    },
  });
};

type Result<O, E> = { _tag: "err"; error: E } | { _tag: "ok"; value: O };

function parseUser(user: {
  email: string | null;
  password: string | null;
  passwordConfirmation: string | null;
  displayName: string | null;
}): Result<{ email: string; password: string; displayName: string }, string[]> {
  const email = user.email?.trim();
  const password = user.password?.trim();
  const displayName = user.displayName?.trim();

  const errors: string[] = [];
  if (!email) {
    errors.push("Email is mandatory");
  } else if (!email.includes("@")) {
    errors.push("A user email must contain @");
  }

  if (!password) {
    errors.push("Password is mandatory");
  }

  if (password !== user.passwordConfirmation?.trim()) {
    errors.push("Passwords don't match");
  }

  if (!displayName || displayName.length < 2) {
    errors.push("Please provide at least 2 letters in the display name");
  }

  if (errors.length) {
    return { _tag: "err", error: errors };
  }

  return {
    _tag: "ok",
    value: { email: email!, password: password!, displayName: displayName! },
  };
}
