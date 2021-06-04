import { ErrorBoundaryShim, ErrorBoundaryShimProps } from "./ErrorBoundaryShim";
import React from "react";
import { useLocation } from "react-router";
import { ErrorBoundary as ErrorBoundaryClientImpl } from "react-error-boundary";

function ErrorBoundaryClient(props: ErrorBoundaryShimProps) {
  const location = useLocation();
  return (
    <ErrorBoundaryClientImpl
      fallbackRender={({ error }) => {
        return <props.fallbackComponent error={error} />;
      }}
      resetKeys={[location]}
      children={props.children}
    />
  );
}

export const ErrorBoundary = import.meta.env.SSR
  ? ErrorBoundaryShim
  : ErrorBoundaryClient;
