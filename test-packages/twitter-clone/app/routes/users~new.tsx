import React from "react";
import { ActionFn, LoaderFn, redirectTo, useRouteData } from "remastered";
import { getSession } from "../session";
import * as User from "../models/User";
import { useHref } from "react-router";

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
    session.flash("errors", user$.error);
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

type Data = {
  errors?: string[];
};

export const loader: LoaderFn<Data> = async ({ request }) => {
  const session = await getSession(request);
  const errors = session.get("errors");
  return {
    errors: Array.isArray(errors) ? (errors as string[]) : undefined,
  };
};

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

export default function NewUser() {
  const routeData = useRouteData<Data>();

  return (
    <>
      <h1>Register</h1>
      {routeData.errors && (
        <ul className="list-bullet text-red-500">
          {routeData.errors.map((error) => {
            return <li key={error}>{error}</li>;
          })}
        </ul>
      )}
      <form
        action={useHref(".")}
        method="post"
        className="p-4 bg-gray-100 space-y-2 max-w-screen-md"
      >
        <label className="flex items-center space-x-4">
          <span>Display Name</span>
          <input
            type="name"
            name="name"
            placeholder="John Doe"
            className="flex-1 block p-2 bg-white rounded"
          />
        </label>
        <label className="flex items-center space-x-4">
          <span>Email</span>
          <input
            type="email"
            name="email"
            placeholder="my@email.com"
            className="flex-1 block p-2 bg-white rounded"
          />
        </label>
        <label className="flex items-center space-x-4">
          <span>Password</span>
          <input
            type="password"
            name="password"
            placeholder="passw0rd"
            className="flex-1 block p-2 bg-white rounded"
          />
        </label>
        <label className="flex items-center space-x-4">
          <span>Confirm Password</span>
          <input
            type="password"
            name="password_confirmation"
            placeholder="passw0rd"
            className="flex-1 block p-2 bg-white rounded"
          />
        </label>
        <button type="submit">Sign up</button>
      </form>
    </>
  );
}
