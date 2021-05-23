import React from "react";
import { Meta, Scripts, Links, Outlet, MetaFn, HeadersFn } from "remastered";
import remasteredPkg from "remastered/package.json";
import "tailwindcss/tailwind.css";

export default function Layout() {
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

export const meta: MetaFn<unknown> = () => {
  return {
    title: `Remastered v${remasteredPkg.version}`,
    description: `Remastered: a full-stack approach to React development.`,
  };
};

export const headers: HeadersFn = () => {
  return {
    "X-Framework": `Remastered v${remasteredPkg.version}`,
  };
};
