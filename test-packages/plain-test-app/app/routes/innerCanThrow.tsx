import { Outlet, NavLink, ErrorBoundary as EB } from "remastered";
import React from "react";

export default function InnerThrows() {
  return (
    <>
      <h1>The inner outlet can throw</h1>
      <p>But I will catch it</p>
      <p>
        <NavLink to="">Doesn't throw</NavLink>{" "}
        <NavLink to="throws">throws</NavLink>{" "}
        <NavLink to="critical">critical (don't catch in outlet)</NavLink>{" "}
        <NavLink to="parse-integer-hello">backend throws a string</NavLink>{" "}
        <NavLink to="parse-integer-3.14">backend throws an error</NavLink>{" "}
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
