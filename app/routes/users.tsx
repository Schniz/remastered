import React from "react";
import { Outlet } from "react-router";
import { Link, NavLink } from "react-router-dom";
import { useRouteData } from "../../src/LoaderContext";
import { LoaderFn } from "../../src/routeTypes";
import { User, database } from "../database";
import "./users.css";

export const loader: LoaderFn<User[]> = async () => {
  return [...database.values()];
};

export default function Users() {
  const users = useRouteData<User[]>();

  return (
    <div>
      Hello, this will not override, but won't be visible in{" "}
      <Link to="register">the registration page</Link>.
      <div>
        <NavLink className="nav-link" to={"not-found"}>
          Missing member
        </NavLink>
        {users.map((user) => (
          <NavLink className="nav-link" to={user.slug} key={user.slug}>
            {user.name}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  );
}
