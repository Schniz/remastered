import React from "react";
import "tailwindcss/tailwind.css";
import { Outlet, Meta, Links, Scripts } from "@remastered/core";

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
