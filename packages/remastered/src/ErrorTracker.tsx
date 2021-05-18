import React from "react";
import { Outlet, useLocation } from "react-router";
import { Error404 } from "./Error404";
import { NotFoundAndSkipRenderOnServerContext } from "./NotFoundAndSkipRenderOnServerContext";

export function ErrorTracker() {
  const key = useLocation().key;
  const ctx = React.useContext(NotFoundAndSkipRenderOnServerContext);
  const shouldShow404 = ctx.state?.get(key);

  if (shouldShow404 === "not_found") {
    return <Error404 />;
  }

  return <Outlet />;
}
