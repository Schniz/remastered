import React from "react";
import { LoaderFn, useRouteData } from "remastered";

type Data = { shouldFail: boolean };

export const loader: LoaderFn<Data> = async ({ request }) => {
  return {
    shouldFail: new URL(request.url, "https://example.com").searchParams.has(
      "fail"
    ),
  };
};

export default function Fails() {
  const routeData = useRouteData<Data>();

  if (routeData.shouldFail) {
    throw new Error(`Should fail!`);
  }

  return <h1>All good!</h1>;
}

export function ErrorBoundary(props: { error: unknown }) {
  return (
    <>
      <h1>Oh no, an error occured!</h1>
      <p>{String(props.error)}</p>
    </>
  );
}
