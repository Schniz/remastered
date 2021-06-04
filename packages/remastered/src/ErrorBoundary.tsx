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

/**
 * An error boundary component that works both on the client and in SSR
 *
 * Wrap any bad-behaving component to avoid a broken website!
 */
export const ErrorBoundary = import.meta.env.SSR
  ? ErrorBoundaryShim
  : ErrorBoundaryClient;
