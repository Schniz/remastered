import React from "react";
import { ActionFn, LoaderFn, redirectTo, useRouteData } from "remastered";
import { getSession } from "../session";
import * as User from "../models/User";
import { useHref } from "react-router";

export const action: ActionFn = async ({ request }) => {
  const text = new URLSearchParams(await request.text());
  const user$ = parseUser({
    username: text.get("username"),
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

  const { password, displayName, username } = user$.value;
  const user = await User.signUp({
    plaintextPassword: password,
    displayName,
    username,
  });
  session.set("userId", user.id);
  session.flash("notice", "Successfuly registered!");
  return redirectTo(`/@${user.id}`, {
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
  username: string | null;
  password: string | null;
  passwordConfirmation: string | null;
  displayName: string | null;
}): Result<
  { password: string; displayName: string; username: string },
  string[]
> {
  const password = user.password?.trim();
  const displayName = user.displayName?.trim();
  const username = user.username?.trim();

  const errors: string[] = [];

  if (!password) {
    errors.push("Password is mandatory");
  }

  if (password !== user.passwordConfirmation?.trim()) {
    errors.push("Passwords don't match");
  }

  if (!displayName || displayName.length < 2) {
    errors.push("Please provide at least 2 letters in the display name");
  }

  if (!username || username.length < 2) {
    errors.push("Username must be longer than 2 characters");
  } else if (!/^[A-z._0-9]+$/.test(username)) {
    errors.push(
      "Username must be alphanumeric characters (A-z, 0-9) or a dot (.) or an underscore (_)"
    );
  }

  if (errors.length) {
    return { _tag: "err", error: errors };
  }

  return {
    _tag: "ok",
    value: {
      password: password!,
      displayName: displayName!,
      username: username!,
    },
  };
}

export default function NewUser() {
  const routeData = useRouteData<Data>();

  return (
    <>
      <h1>Register</h1>
      {routeData.errors && (
        <ul className="text-red-500 list-bullet">
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
          <span>Username</span>
          <input
            required
            type="text"
            name="username"
            placeholder="john.doe"
            className="flex-1 block p-2 bg-white rounded"
          />
        </label>
        <label className="flex items-center space-x-4">
          <span>Display Name</span>
          <input
            type="text"
            name="name"
            placeholder="John Doe"
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
