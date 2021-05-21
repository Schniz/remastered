import React from "react";
import { Meta, Scripts, Links, Outlet } from "remastered";
/* import "tailwindcss/tailwind.css"; */

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
