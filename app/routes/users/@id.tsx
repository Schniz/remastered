import React from "react";
import { redirectTo } from "../../../src/httpHelpers";
import { useRouteData } from "../../../src/LoaderContext";
import type { LoaderFn } from "../../../src/routeTypes";
import { Match } from "../../../src/useMatches";
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

export const handle = {
  breadcrumbs: (match: Match<User>) => `${match.data.name}`,
};
