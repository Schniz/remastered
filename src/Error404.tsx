import React from "react";
import { useLocation } from "react-router";

function Default404() {
  const { pathname } = useLocation();
  return (
    <h1>
      Page <code>{pathname}</code> not found
    </h1>
  );
}

export function Error404() {
  const userRoutes = import.meta.globEager("../app/routes/404.{t,j}sx");
  const Route = Object.values(userRoutes)[0]?.default ?? Default404;
  return <Route />;
}
