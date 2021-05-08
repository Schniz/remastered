import { Outlet, NavLink } from "react-router-dom";
import React from "react";

export default function Layout() {
  return (
    <>
      <nav>
        <NavLink to="/">Home</NavLink>
        {" / "}
        <NavLink to="about">About</NavLink>
      </nav>
      <Outlet />
    </>
  );
}
