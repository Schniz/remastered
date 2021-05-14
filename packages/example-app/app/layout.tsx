import { Outlet, NavLink } from "react-router-dom";
import React from "react";
import { Links, Scripts, Meta } from "../src/JsxForDocument";
import { Match, useMatches } from "../src/useMatches";
import "./layout.css";

type HasBreadcrumbs = Match & {
  handle: {
    breadcrumbs(match: Match): React.ReactNode;
  };
};

export default function Layout() {
  const routeMatches = useMatches();
  const withScripts = !routeMatches.every((x) => (x.handle as any)?.noScripts);
  const breadcrumbs = routeMatches
    .filter(
      (x: any): x is HasBreadcrumbs =>
        typeof x.handle?.breadcrumbs === "function"
    )
    .map((x, i) => {
      const breadcrumb = x.handle.breadcrumbs(x);
      if (i === 0) {
        return breadcrumb;
      } else {
        return (
          <React.Fragment key={x.pathname}> / {breadcrumb}</React.Fragment>
        );
      }
    });

  return (
    <html>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        {breadcrumbs.length > 0 && <h1>Breadcrumbs: {breadcrumbs}</h1>}
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
