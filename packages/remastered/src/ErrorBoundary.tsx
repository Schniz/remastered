import { ErrorBoundaryShim, ErrorBoundaryShimProps } from "./ErrorBoundaryShim";
import React from "react";

type ErrorBoundaryClientState = {
  error?: Error;
};

class ErrorBoundaryClient extends React.Component<
  ErrorBoundaryShimProps,
  ErrorBoundaryClientState
> {
  state = {} as ErrorBoundaryClientState;

  static getDerivedStateFromError(error: null | Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <this.props.fallbackComponent error={this.state.error} />;
    }

    return <>{this.props.children}</>;
  }
}

export const ErrorBoundary = import.meta.env.SSR
  ? ErrorBoundaryShim
  : ErrorBoundaryClient;
