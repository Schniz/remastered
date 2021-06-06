import React from "react";
import { redirectTo, useRouteData, LoaderFn, MetaFn, Match } from "remastered";
import { User, database } from "../../database";

export const loader: LoaderFn<User | Response> = async ({ params }) => {
  if (params.id === "redirect_to_gal") {
    return redirectTo(`/users/gal`);
  }

  if (params.id === "censor") {
    throw new Error("This is censored");
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

export function ErrorBoundary({ error }: { error: any }) {
  return (
    <>
      <h1>An error occured</h1>
      <p>{String(error)}</p>
    </>
  );
}
