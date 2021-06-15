import { prisma } from "../../db";
import { ActionFn, redirectTo } from "remastered";
import { getSession } from "../../session";
import bcrypt from "bcryptjs";

export const action: ActionFn = async ({ request }) => {
  const text = new URLSearchParams(await request.text());
  const user$ = parseUser({
    email: text.get("email"),
    password: text.get("password"),
    passwordConfirmation: text.get("password_confirmation"),
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

  const { email, password } = user$.value;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      display_name: "John Doe",
      email: email,
      hashed_password: hashedPassword,
    },
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
}): Result<{ email: string; password: string }, string[]> {
  const email = user.email?.trim();
  const password = user.password?.trim();

  const errors: string[] = [];
  if (!user.email?.trim()) {
    errors.push("Email is mandatory");
  } else if (!user.email.includes("@")) {
    errors.push("A user email must contain @");
  }

  if (!password?.trim()) {
    errors.push("Password is mandatory");
  }

  if (password !== user.passwordConfirmation?.trim()) {
    errors.push("Passwords don't match");
  }

  if (errors.length) {
    return { _tag: "err", error: errors };
  }

  return { _tag: "ok", value: { email: email!, password: password! } };
}
