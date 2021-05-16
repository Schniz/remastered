import React from "react";
import "tailwindcss/tailwind.css";
import { Outlet, Meta, Links, Scripts, useMatches } from "@remastered/core";

export default function Layout() {
  const matches = useMatches();
  const showScripts = matches.every((x) => !(x.handle as any)?.noscript);

  return (
    <html>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        {showScripts && <Scripts />}
      </body>
    </html>
  );
}
