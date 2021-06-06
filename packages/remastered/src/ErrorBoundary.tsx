import { ErrorBoundaryShim, ErrorBoundaryShimProps } from "./ErrorBoundaryShim";
import React from "react";
import { useLocation } from "react-router";
import { ErrorBoundary as ErrorBoundaryClientImpl } from "react-error-boundary";
import { SetStatusCodeContext } from "./SetStatusCodeContext";

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
const ErrorBoundaryImpl = import.meta.env.SSR
  ? ErrorBoundaryShim
  : ErrorBoundaryClient;

export function ErrorBoundary(props: ErrorBoundaryShimProps) {
  const fallbackComponent = React.useCallback(
    ({ error }) => {
      const setStatusCode = React.useContext(SetStatusCodeContext);
      setStatusCode(500);

      return <props.fallbackComponent error={error} />;
    },
    [props.fallbackComponent]
  );

  return (
    <ErrorBoundaryImpl
      children={props.children}
      fallbackComponent={fallbackComponent}
    />
  );
}
