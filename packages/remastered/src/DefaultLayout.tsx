import React from "react";
import { Outlet } from "react-router";
import { Links, Meta, Scripts } from "./JsxForDocument";

export default function DefaultLayout() {
  return (
    <html>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
