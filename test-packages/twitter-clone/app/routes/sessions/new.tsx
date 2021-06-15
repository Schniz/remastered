import { getSession } from "../../session";
import React from "react";
import { useHref } from "react-router";
import { LoaderFn, ActionFn, redirectTo, useRouteData } from "remastered";
import { prisma } from "../../db";
import bcrypt from "bcryptjs";
import { HttpRequest } from "remastered/dist/HttpTypes";

function redirectBack(
  request: HttpRequest,
  { fallback, ...opts }: ResponseInit & { fallback: string }
): Response {
  const referrer = request.headers.get("referer");
  return redirectTo(referrer ?? fallback, opts);
}

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

  const email = searchParams.get("email");
  const password = searchParams.get("password");

  if (!email || !password) {
    session.flash("error", "Missing email or password");

    return redirectBack(request, {
      fallback: ".",
      headers: {
        "Set-Cookie": await session.commit(),
      },
    });
  }

  const user = await prisma.user.findFirst({ where: { email } });

  if (user?.hashed_password) {
    const allowed = await bcrypt.compare(password, user.hashed_password);
    if (allowed) {
      session.set("userId", user.id);
      session.flash("notice", `Successfuly logged in as ${user.display_name}`);
      return redirectTo("/", {
        headers: {
          "Set-Cookie": await session.commit(),
        },
      });
    }
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
        <button type="submit">Log in</button>
      </form>
    </>
  );
}
