import { Outlet, NavLink, useLocation } from "react-router-dom";
import React from "react";
import { Links, Scripts } from "../src/JsxForDocument";

export default function Layout() {
  const location = useLocation();

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
        {location.pathname.includes("/noscript") ? null : <Scripts />}
      </body>
    </html>
  );
}
