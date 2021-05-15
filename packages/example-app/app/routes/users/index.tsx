import React from "react";
import { redirectTo } from "@remaster/core/dist/src/httpHelpers";
import { ActionFn, MetaFn } from "@remaster/core/dist/src/routeTypes";
import { database } from "../../database";

export const action: ActionFn = async ({ req }) => {
  const body = new URLSearchParams(await req.text());
  const name = body.get("name")!;
  const slug = name.replace(/[^A-z0-9]/g, "-");
  database.set(slug, { name, slug });
  return redirectTo(`/users/${slug}`);
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
