import React from "react";
import { useRouteData } from "../../../src/LoaderContext";
import type { LoaderFn } from "../../../src/routeTypes";
import { User, database } from "../../database";

export const loader: LoaderFn<User> = async ({ params }) => {
  return database.get(params.id);
};

export default function ViewUser() {
  const data = useRouteData<User>();

  return <h1>{data.name}</h1>;
}
