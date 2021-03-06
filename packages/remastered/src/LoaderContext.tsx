import React from "react";
import { useLocation } from "react-router";
import { useRouteModule } from "./routeTreeIntoReactRouterRoute";

/**
 * Keys are: `${location.key}@${fsRouteKey}`
 */
export const LoaderContext = React.createContext<
  Map<string, Result<unknown, unknown>>
>(new Map());

export type Result<O, E> = { tag: "ok"; value: O } | { tag: "err"; error: E };

// I need to figure out how to make it work.
// I need some magic to catch the current route key. Maybe I can populate it with contexts?
export function useRouteData<P>(routeKey?: string): P {
  const location = useLocation();
  const loaderContext = React.useContext(LoaderContext);
  routeKey = routeKey ?? useRouteModule();
  const key = `${location.key}@${routeKey}`;
  const value = loaderContext.get(key);

  if (value?.tag === "err") {
    throw value.error;
  } else if (!value) {
    console.log("ctx", loaderContext, key);
    throw new Error(`Route has no loader`);
  }

  return value.value as P;
}
