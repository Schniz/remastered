import React from "react";
import { redirectTo } from "@remaster/core/dist/src/httpHelpers";
import { useRouteData } from "@remaster/core/dist/src/LoaderContext";
import type { LoaderFn, MetaFn } from "@remaster/core/dist/src/routeTypes";
import { Match } from "@remaster/core/dist/src/useMatches";
import { User, database } from "../../database";

export const loader: LoaderFn<User | Response> = async ({ params }) => {
  if (params.id === "redirect_to_gal") {
    return redirectTo(`/users/gal`);
  }

  return database.get(params.id);
};

export default function ViewUser() {
  const data = useRouteData<User>();

  return <h1>{data.name}</h1>;
}

export const meta: MetaFn<User> = ({ data }) => ({
  title: `${data.name}'s profile`,
});

export const handle = {
  breadcrumbs: (match: Match<User>) => `${match.data.name}`,
};
