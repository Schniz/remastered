import React from "react";
import { useOutlet } from "react-router";
import { Link, NavLink } from "react-router-dom";
import { useRouteData } from "../../src/LoaderContext";
import { ActionFn, LoaderFn } from "../../src/routeTypes";
import { User, database } from "../database";
import "./users.css";
import { Response } from "node-fetch";

type Data = (User & { slug: string })[];

export const loader: LoaderFn<Data> = async () => {
  return [...database].map(([slug, user]) => {
    return { ...user, slug };
  });
};

export const action: ActionFn = async ({ req }) => {
  const body = new URLSearchParams(await req.text());
  const name = body.get("name")!;
  const slug = name.replace(/[^A-z0-9]/g, "-");
  database.set(slug, { name });
  return new Response("", {
    status: 302,
    headers: {
      Location: "/users",
    },
  });
};

export default function Users() {
  const routeData = useRouteData<Data>();
  const outlet = useOutlet();

  return (
    <div>
      Hello, this will not override, but won't be visible in{" "}
      <Link to="register">the registration page</Link>.
      <div>
        <NavLink className="nav-link" to={"not-found"}>
          Missing member
        </NavLink>
        {routeData.map((project) => (
          <React.Fragment key={project.slug}>
            <NavLink className="nav-link" to={project.slug}>
              {project.name}
            </NavLink>
          </React.Fragment>
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
