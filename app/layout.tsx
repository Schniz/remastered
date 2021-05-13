import { Outlet, NavLink } from "react-router-dom";
import React from "react";
import { Links, Scripts } from "../src/JsxForDocument";

export default function Layout() {
  return (
    <html>
      <head>
        <Links />
      </head>
      <body>
        <nav>
          <NavLink to="/">Home</NavLink>
          {" / "}
          <NavLink to="about">About</NavLink>
          {" / "}
          <NavLink to="users">Users</NavLink>
          {" / "}
          <NavLink to="users/gal">Gal</NavLink>
        </nav>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
