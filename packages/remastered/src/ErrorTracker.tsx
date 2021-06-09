import React from "react";
import { Outlet } from "react-router";
import { useRenderingError } from "./NotFoundAndSkipRenderOnServerContext";
import { Error404 } from "./UserOverridableComponents";
import { Error500 } from "./UserOverridableComponents";
import { ErrorBoundary } from "./ErrorBoundary";

export function ErrorTracker() {
  const renderingError = useRenderingError();

  return (
    <ErrorBoundary fallbackComponent={Error500}>
      {renderingError?.tag === "not_found" ? <Error404 /> : <Outlet />}
    </ErrorBoundary>
  );
}
