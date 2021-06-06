import React from "react";
import { LoaderFn, useRouteData } from "remastered";

export const loader: LoaderFn<number> = async ({ params }) => {
  const number = Number(params.number);
  if (number !== number) {
    throw "The given value was not a number";
  }
  if (Math.round(number) !== number) {
    throw new Error("The given value was not an integer");
  }
  return number;
};

export default function ParseInteger() {
  const number = useRouteData();
  return <p>This is an actual integer! {number}</p>;
}

export function ErrorBoundary({ error }: { error: any }) {
  return <p>Can't parse: {error}</p>;
}
