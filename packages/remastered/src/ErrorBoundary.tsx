import type { ErrorBoundaryShimProps } from "./ErrorBoundaryShim";
import { ErrorBoundaryShim } from "server-only:./ErrorBoundaryShim";
import React from "react";
import { SetStatusCodeContext } from "./SetStatusCodeContext";
import { ErrorBoundaryClient } from "client-only:./ErrorBoundaryClient";

let ErrorBoundaryImpl: React.ComponentType<ErrorBoundaryShimProps>;

if (import.meta.env.SSR) {
  ErrorBoundaryImpl = ErrorBoundaryShim;
} else {
  ErrorBoundaryImpl = ErrorBoundaryClient;
}

/**
 * An error boundary component that works both on the client and in SSR
 *
 * Wrap any bad-behaving component to avoid a broken website!
 */
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
