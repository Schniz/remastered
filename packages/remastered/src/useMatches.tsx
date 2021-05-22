import React from "react";
import { useLocation, matchRoutes, Params } from "react-router";
import { getRouteElements } from "./fsRoutes";
import { LoaderContext } from "./LoaderContext";
import { MetaFn } from "./routeTypes";
import { LAYOUT_ROUTE_KEY } from "./magicConstants";

export type RouteDef = { hasLoader: boolean; handle?: unknown; meta?: MetaFn };
export const MatchesContext = React.createContext<Map<string, RouteDef>>(
  new Map()
);

export type Match<Data = unknown> = {
  handle?: unknown;
  params: Params;
  pathname: string;
  data: Data;
  meta?: MetaFn;
};

export function useMatches(): Match[] {
  const routeElements = getRouteElements();
  const location = useLocation();
  const map = React.useContext(MatchesContext);
  const loaderContext = React.useContext(LoaderContext);
  const matched = React.useMemo(() => {
    const matchedRoutes = [...(matchRoutes(routeElements, location) ?? [])];
    matchedRoutes.unshift({
      route: {
        caseSensitive: false,
        path: "/",
        element: {},
        ...({
          routeFile: LAYOUT_ROUTE_KEY,
        } as any),
      },
      pathname: "/",
      params: {},
    });
    return matchedRoutes;
  }, [location]);
  const routeMatches = (matched ?? []).flatMap((route): Match[] => {
    const routeFile: string = (route.route as any).routeFile;
    const value = map.get(routeFile);
    if (!value) {
      return [];
    }
    return [
      {
        handle: value.handle,
        pathname: route.pathname,
        params: route.params,
        data: loaderContext.get(`${location.key}@${routeFile}`),
        meta: value.meta,
      },
    ];
  });
  return routeMatches;
}
