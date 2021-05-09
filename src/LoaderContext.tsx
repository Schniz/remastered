import React from "react";
import { RouteKeyContext } from "./routeTreeIntoReactRouterRoute";

export const LoaderContext = React.createContext<Map<string, unknown>>(
  new Map()
);

// I need to figure out how to make it work.
// I need some magic to catch the current route key. Maybe I can populate it with contexts?
export function useRouteData<P>(): P {
  const loaderContext = React.useContext(LoaderContext);
  const routeKey = React.useContext(RouteKeyContext);
  const value = loaderContext.get(routeKey ?? "nopenopenope");
  return value as P;
}
