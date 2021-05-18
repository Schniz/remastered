import React from "react";
import { useLocation } from "react-router";

export default function Default404() {
  const { pathname } = useLocation();
  return (
    <>
      <h1>
        Page <code>{pathname}</code> not found
      </h1>
      <small>
        Overwrite this page by adding a <code>404.tsx</code> file
      </small>
    </>
  );
}
