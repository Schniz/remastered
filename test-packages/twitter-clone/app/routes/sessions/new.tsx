import { getSession } from "../../session";
import React from "react";
import { useHref } from "react-router";
import { LoaderFn, ActionFn, redirectTo, useRouteData } from "remastered";
import { redirectBack } from "../../redirectBack";
import * as User from "../../models/User";

type Data = { error?: string };

export const loader: LoaderFn<Data> = async ({ request }) => {
  const session = await getSession(request);
  const error = session.get("error");
  return {
    error: typeof error === "string" ? error : undefined,
  };
};

export const action: ActionFn = async ({ request }) => {
  const session = await getSession(request);
  session.unset("userId");

  const searchParams = new URLSearchParams(await request.text());

  const username = searchParams.get("username");
  const password = searchParams.get("password");

  if (!username || !password) {
    session.flash("error", "Missing username or password");

    return redirectBack(request, {
      fallback: ".",
      headers: {
        "Set-Cookie": await session.commit(),
      },
    });
  }

  const user = await User.logIn(username, password);

  if (user) {
    session.set("userId", user.id);
    session.flash("notice", `Successfuly logged in as ${user.display_name}`);
    return redirectTo("/", {
      headers: {
        "Set-Cookie": await session.commit(),
      },
    });
  }

  session.flash("error", "Wrong username/password");
  return redirectBack(request, {
    fallback: ".",
    headers: {
      "Set-Cookie": await session.commit(),
    },
  });
};

export default function NewSession() {
  const routeData = useRouteData<Data>();
  const formAction = useHref(".");

  return (
    <>
      <h1>Log in</h1>
      {routeData.error && <p className="text-red-500">{routeData.error}</p>}
      <form
        action={formAction}
        method="post"
        className="p-4 bg-gray-100 space-y-2 max-w-screen-md"
      >
        <label className="flex items-center space-x-4">
          <span>Username</span>
          <input
            type="text"
            name="username"
            placeholder="john.doe"
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
        <button type="submit">Log in</button>
      </form>
    </>
  );
}
