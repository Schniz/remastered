import React from "react";
import { ErrorBoundary as ErrorBoundaryClientImpl } from "react-error-boundary";
import type { ErrorBoundaryShimProps } from "./ErrorBoundaryShim";
import { useLocation } from "react-router";

export function ErrorBoundaryClient(props: ErrorBoundaryShimProps) {
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
