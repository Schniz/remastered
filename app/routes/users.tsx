import React from "react";
import { Outlet } from "react-router";
import { Link, NavLink } from "react-router-dom";
import { useRouteData } from "../../src/LoaderContext";
import { LoaderFn } from "../../src/routeTypes";
import { User, database } from "../database";

type Data = (User & { slug: string })[];

export const loader: LoaderFn<Data> = async () => {
  return [...database].map(([slug, user]) => {
    return { ...user, slug };
  });
};

export default function Users() {
  const routeData = useRouteData<Data>();

  return (
    <div>
      Hello, this will not override, but won't be visible in{" "}
      <Link to="register">the registration page</Link>.
      <div>
        {routeData.map((project) => (
          <React.Fragment key={project.slug}>
            <NavLink to={project.slug}>{project.name}</NavLink>{" "}
          </React.Fragment>
        ))}
      </div>
      <Outlet />
    </div>
  );
}
