import React from "react";
import { useParams } from "react-router-dom";
import { useRouteData } from "../../../src/LoaderContext";
import { LoaderFn } from "../../../src/routeTypes";
import { database } from "../../database";

export const loader: LoaderFn<unknown> = async ({ params }) => {
  return database.get(params.id);
};

export default function User() {
  const { id } = useParams();
  const data = useRouteData<{ name: string }>();

  return (
    <>
      <div>User {id}!</div>
      <div>Name: {data?.name}</div>
    </>
  );
}
