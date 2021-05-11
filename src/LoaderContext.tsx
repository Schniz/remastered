import React from "react";
import { useLocation, useParams } from "react-router";
import { useRouteModule } from "./routeTreeIntoReactRouterRoute";

/**
 * Keys are: `${location.key}@${fsRouteKey}@${JSON.stringify(location.params)}`
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
  const params = useParams();
  const key = `${location.key}@../app/routes/${routeKey}@${JSON.stringify(
    params
  )}`;
  const value = loaderContext.get(key);

  return value as P;
}
