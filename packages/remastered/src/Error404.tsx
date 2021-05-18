import React from "react";
import { useLocation } from "react-router";
import Custom404 from "glob-first:/app/routes/404.{t,j}s{x,}";

function Default404() {
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

export const Error404 = __glob_matches__("/app/routes/404.{t,j}s{x,}")
  ? Custom404
  : Default404;
