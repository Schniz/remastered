import React from "react";
import { useParams } from "react-router-dom";
import { useRouteData } from "../../../src/LoaderContext";
import type { LoaderFn } from "../../../src/routeTypes";
import { database, User } from "../../database";

export const loader: LoaderFn<User> = async ({ params }) => {
  return database.get(params.id);
};

export default function ViewUser() {
  const { id } = useParams();
  const data = useRouteData<User>();

  return (
    <>
      <div>User {id}!</div>
      <div>Name: {data.name}</div>
    </>
  );
}
