import { getSession } from "../../session";
import React from "react";
import { redirectTo, ActionFn, MetaFn } from "remastered";
import { database } from "../../database";

export const action: ActionFn = async ({ request }) => {
  const session = await getSession(request);
  if (!session.has("userId")) {
    session.flash("errors", ["Not authorized yet"]);
    return redirectTo(`/users`, {
      headers: { "Set-Cookie": await session.commit() },
    });
  }

  const body = new URLSearchParams(await request.text());
  const name = body.get("name")!;
  const slug = name.replace(/[^A-z0-9]/g, "-");
  database.set(slug, { name, slug, createdBy: String(session.get("userId")) });

  session.flash("notices", [`User ${name} was created successfuly!`]);

  return redirectTo(`/users/${slug}`, {
    headers: { "Set-Cookie": await session.commit() },
  });
};

export default function UsersIndex() {
  return (
    <form method="post">
      <input type="text" placeholder="name" name="name" />
      <button type="submit">Submit</button>
    </form>
  );
}

export const handle = {
  breadcrumbs: () => "All Users",
};

export const meta: MetaFn = () => {
  return {
    title: "List of all users",
  };
};
