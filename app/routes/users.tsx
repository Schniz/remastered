import React from "react";
import { Outlet } from "react-router";
import { Link } from "react-router-dom";

export default function Users() {
  return (
    <div>
      Hello, this will not override, but won't be visible in{" "}
      <Link to="register">the registration page</Link>.
      <Outlet />
    </div>
  );
}
