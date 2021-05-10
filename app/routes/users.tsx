import React from "react";
import { Outlet } from "react-router";
import { Link, NavLink } from "react-router-dom";
import { useRouteData } from "../../src/LoaderContext";
import { LoaderFn } from "../../src/routeTypes";
import { database } from "../database";

type Data = string[];

export const loader: LoaderFn<Data> = async () => {
  return [...database.keys()];
};

export default function Users() {
  const routeData = useRouteData<Data>();

  return (
    <div>
      Hello, this will not override, but won't be visible in{" "}
      <Link to="register">the registration page</Link>.
      <div>
        {routeData.map((name) => (
          <React.Fragment key={name}>
            <NavLink to={name}>{name}</NavLink>{" "}
          </React.Fragment>
        ))}
      </div>
      <Outlet />
    </div>
  );
}
