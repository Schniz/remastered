import React from "react";
import { useRouteModule } from "./routeTreeIntoReactRouterRoute";

export const LoaderContext = React.createContext<Map<string, unknown>>(
  new Map()
);

// I need to figure out how to make it work.
// I need some magic to catch the current route key. Maybe I can populate it with contexts?
export function useRouteData<P>(routeKey?: string): P {
  const loaderContext = React.useContext(LoaderContext);
  routeKey = routeKey ?? useRouteModule();
  const key = `../app/routes/${routeKey}`;
  const value = loaderContext.get(key);

  return value as P;
}
