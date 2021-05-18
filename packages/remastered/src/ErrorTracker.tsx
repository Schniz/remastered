import React from "react";
import { Outlet, useLocation } from "react-router";
import { NotFoundAndSkipRenderOnServerContext } from "./NotFoundAndSkipRenderOnServerContext";
import { Error404 } from "./UserOverridableComponents";

export function ErrorTracker() {
  const key = useLocation().key;
  const ctx = React.useContext(NotFoundAndSkipRenderOnServerContext);
  const shouldShow404 = ctx.state?.get(key);

  if (shouldShow404 === "not_found") {
    return <Error404 />;
  }

  return <Outlet />;
}
