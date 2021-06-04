import { Outlet, NavLink } from "remastered";
import React from "react";
import { ErrorBoundary as EB } from "remastered/dist/ErrorBoundary";

export default function InnerThrows() {
  return (
    <>
      <h1>The inner outlet can throw</h1>
      <p>But I will catch it</p>
      <p>
        <NavLink to="">Doesn't throw</NavLink>{" "}
        <NavLink to="throws">throws</NavLink>{" "}
        <NavLink to="critical">critical (don't catch in outlet)</NavLink>{" "}
      </p>
      <EB fallbackComponent={OutletBoundary}>
        <Outlet />
      </EB>
    </>
  );
}

function OutletBoundary(props: { error: any }) {
  if (typeof props.error === "string") {
    throw props.error;
  }

  return (
    <>
      <p>Oh no! We had an error! But thankfully I catched it.</p>
      <p>{String(props.error)}</p>
    </>
  );
}

export function ErrorBoundary({ error }: { error: unknown }) {
  return (
    <div>
      <h1>This is an ErrorBoundary</h1>
      <p>Oh no! We had an error! But thankfully I catched it.</p>
      <p>{String(error)}</p>
    </div>
  );
}
