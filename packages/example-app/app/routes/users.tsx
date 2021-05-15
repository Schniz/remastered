import React from "react";
import { useRouteData, LoaderFn, Link, NavLink, Outlet } from "@remaster/core";
import { User, database } from "../database";
import s from "./users.module.css";

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
        <NavLink className={s.navLink} to={"not-found"}>
          Missing member
        </NavLink>
        {users.map((user) => (
          <NavLink className={s.navLink} to={user.slug} key={user.slug}>
            {user.name}
          </NavLink>
        ))}
      </div>
      <Outlet />
    </div>
  );
}

export const handle = {
  breadcrumbs: () => "Users",
};
