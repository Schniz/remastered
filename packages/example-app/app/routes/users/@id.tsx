import React from "react";
import {
  redirectTo,
  useRouteData,
  LoaderFn,
  MetaFn,
  Match,
} from "@remastered/core";
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
  title: `${data?.name}'s profile`,
});

export const handle = {
  breadcrumbs: (match: Match<User>) => `${match.data?.name ?? "Not found"}`,
};
