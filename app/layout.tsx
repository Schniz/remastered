import { Outlet, NavLink } from "react-router-dom";
import React from "react";
import { Links, Scripts } from "../src/JsxForDocument";
import { useMatches } from "../src/useMatches";

export default function Layout() {
  const routeMatches = useMatches();
  const withScripts = !routeMatches.every((x) => (x.handle as any)?.noScripts);

  return (
    <html>
      <head>
        <Links />
      </head>
      <body>
        <nav>
          <NavLink to="/">Home</NavLink>
          {" / "}
          <NavLink to="/noscript">No Script</NavLink>
          {" / "}
          <NavLink to="about">About</NavLink>
          {" / "}
          <NavLink to="users">Users</NavLink>
          {" / "}
          <NavLink to="users/gal">Gal</NavLink>
        </nav>
        <Outlet />
        {withScripts && <Scripts />}
      </body>
    </html>
  );
}
