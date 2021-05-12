import React from "react";
import { useOutlet } from "react-router";
import { Link, NavLink } from "react-router-dom";
import { useRouteData } from "../../src/LoaderContext";
import { ActionFn, LoaderFn } from "../../src/routeTypes";
import { User, database } from "../database";
import "./users.css";
import { redirectTo } from "../../src/httpHelpers";

export const loader: LoaderFn<User[]> = async () => {
  return [...database.values()];
};

export const action: ActionFn = async ({ req }) => {
  const body = new URLSearchParams(await req.text());
  const name = body.get("name")!;
  const slug = name.replace(/[^A-z0-9]/g, "-");
  database.set(slug, { name, slug });
  return redirectTo("/users");
};

export default function Users() {
  const users = useRouteData<User[]>();
  const outlet = useOutlet();

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
      {outlet ?? <Form />}
    </div>
  );
}

function Form() {
  return (
    <form method="post">
      <input type="text" placeholder="name" name="name" />
      <button type="submit">Submit</button>
    </form>
  );
}
