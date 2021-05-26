import React from "react";
import {
  useRouteData,
  LoaderFn,
  Link,
  NavLink,
  Outlet,
  HeadersFn,
  json,
} from "remastered";
import { User, database } from "../database";
import s from "./users.module.css";
import { getSession } from "../session";

type Data = {
  currentUserId: string;
  users: User[];
  errors?: string[];
  notices?: string[];
};

export const loader: LoaderFn<Response> = async ({ request }) => {
  const session = await getSession(request);
  if (!session.has("userId")) {
    session.set("userId", `user-${Math.round(Math.random() * 100000)}`);
  }

  return json<Data>({
    currentUserId: String(session.get("userId")),
    users: [...database.values()],
    errors: session.get("errors") as any,
    notices: session.get("notices") as any,
  });
};

export const headers: HeadersFn = async ({ request }) => {
  const session = await getSession(request);

  return {
    "Set-Cookie": await session.commit(),
  };
};

export default function Users() {
  const data = useRouteData<Data>();
  const [dismissed, setDismissed] = React.useState<string[]>([]);
  const errors = data.errors?.filter((e) => !dismissed.includes(e));
  const notices = data.notices?.filter((e) => !dismissed.includes(e));

  return (
    <div>
      {errors?.length ? (
        <h4>
          Error!
          <ul>
            {errors.map((error) => (
              <li
                key={error}
                onClick={() => setDismissed((old) => [...old, error])}
              >
                {error}
              </li>
            ))}
          </ul>
        </h4>
      ) : null}
      {notices?.length ? (
        <h4>
          Notice!
          <ul>
            {notices.map((error) => (
              <li
                key={error}
                onClick={() => setDismissed((old) => [...old, error])}
              >
                {error}
              </li>
            ))}
          </ul>
        </h4>
      ) : null}
      Hello {data.currentUserId}! this will not override, but won't be visible
      in <Link to="register">the registration page</Link>.
      <div>
        <NavLink className={s.navLink} to={"not-found"}>
          Missing member
        </NavLink>
        {data.users.map((user) => (
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
