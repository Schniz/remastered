import React from "react";
import { useParams } from "react-router-dom";
import { LoaderFn } from "../../../src/routeTypes";

const database: Record<string, unknown> = {
  gal: { name: "Gal Schlezinger" },
  dean: { name: "Dean Shub" },
  amitush: { name: "Amit Shalev" },
};

export const loader: LoaderFn<unknown> = async ({ params }) => {
  return database[params.id];
};

export default function User(props: { data: { name: string } }) {
  const { id } = useParams();
  return (
    <>
      <div>User {id}!</div>
      <div>Name: {props.data.name}</div>
    </>
  );
}
