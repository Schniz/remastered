import React from "react";
import { Outlet } from "react-router";
import { Link, NavLink } from "react-router-dom";

export default function Users() {
  return (
    <div>
      Hello, this will not override, but won't be visible in{" "}
      <Link to="register">the registration page</Link>.
      <div>
        {["gal", "dean", "amitush"].map((name) => (
          <React.Fragment key={name}>
            <NavLink to={name}>{name}</NavLink>{" "}
          </React.Fragment>
        ))}
      </div>
      <Outlet />
    </div>
  );
}
