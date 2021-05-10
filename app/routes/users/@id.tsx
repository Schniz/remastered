import React from "react";
import { useParams } from "react-router-dom";
import { useFetcher } from "../../../src/fetcher";
import { useRouteData } from "../../../src/LoaderContext";
import { LoaderFn } from "../../../src/routeTypes";

const database: Record<string, unknown> = {
  gal: { name: "Gal Schlezinger" },
  dean: { name: "Dean Shub" },
  amitush: { name: "Amit Shalev" },
};

export const loader: LoaderFn<unknown> = async ({ params }) => {
  return database[params.id];
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
