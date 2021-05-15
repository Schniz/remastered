import React from "react";
import { useLocation } from "react-router";
import { useRouteModule } from "./routeTreeIntoReactRouterRoute";

/**
 * Keys are: `${location.key}@${fsRouteKey}`
 */
export const LoaderContext = React.createContext<Map<string, unknown>>(
  new Map()
);

// I need to figure out how to make it work.
// I need some magic to catch the current route key. Maybe I can populate it with contexts?
export function useRouteData<P>(routeKey?: string): P {
  const location = useLocation();
  const loaderContext = React.useContext(LoaderContext);
  routeKey = routeKey ?? useRouteModule();
  const key = `${location.key}@${routeKey}`;
  const value = loaderContext.get(key);
  console.log({ loaderContext });

  return value as P;
}
