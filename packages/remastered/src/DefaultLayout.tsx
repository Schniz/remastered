import React from "react";
import { Outlet } from "react-router";
import { Scripts, Meta, Links } from "./JsxForDocument";
import type { MetaFn } from "./routeTypes";

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

export const meta: MetaFn<never> = () => {
  return {
    title: "My website",
    generator: "Remastered",
  };
};
