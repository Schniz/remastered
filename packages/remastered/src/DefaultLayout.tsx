import React from "react";
import { Outlet } from "react-router";
import { Scripts, Meta, Links } from "./JsxForDocument";

export function DefaultLayout() {
  return (
    <html>
      <head>
        <meta name="generator" content="Remastered" />
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
