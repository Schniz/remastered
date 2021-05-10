import { Project } from ".prisma/client";
import React from "react";
import { Outlet } from "react-router";
import { Link, NavLink } from "react-router-dom";
import { useRouteData } from "../../src/LoaderContext";
import { LoaderFn } from "../../src/routeTypes";
import { prisma } from "../database";

export const loader: LoaderFn<Project[]> = async () => {
  return prisma.project.findMany();
};

export default function Users() {
  const routeData = useRouteData<Project[]>();

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
