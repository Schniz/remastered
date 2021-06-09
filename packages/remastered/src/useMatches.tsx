import React from "react";
import { useLocation, matchRoutes, Params, RouteMatch } from "react-router";
import { getRouteElements } from "./fsRoutes";
import { LoaderContext } from "./LoaderContext";
import { MetaFn } from "./routeTypes";
import { LAYOUT_ROUTE_KEY } from "./magicConstants";

export type RouteDef = {
  hasLoader: boolean;
  handle?: unknown;
  meta?: MetaFn;
  errorBoundary?: React.ComponentType;
};
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

type RemasteredRouteMatch = RouteMatch & {
  route: RouteMatch["route"] & { routeFile: string };
};

export function useMatches(): Match[] {
  const routeElements = getRouteElements();
  const location = useLocation();
  const map = React.useContext(MatchesContext);
  const loaderContext = React.useContext(LoaderContext);
  const matched = React.useMemo(() => {
    const cleanMatches = matchRoutes(
      routeElements,
      location
    ) as RemasteredRouteMatch[];
    const matchedRoutes = [...(cleanMatches ?? [])];
    matchedRoutes.unshift({
      route: {
        caseSensitive: false,
        path: "/",
        element: {},
        routeFile: LAYOUT_ROUTE_KEY,
      },
      pathname: "/",
      params: {},
    });
    return matchedRoutes;
  }, [location]);
  const routeMatches = (matched ?? []).flatMap((route): Match[] => {
    const { routeFile } = route.route;
    const value = map.get(routeFile);
    if (!value) {
      return [];
    }
    const dataResult = loaderContext.get(`${location.key}@${routeFile}`);
    const data = dataResult?.tag === "ok" ? dataResult.value : undefined;

    return [
      {
        handle: value.handle,
        pathname: route.pathname,
        params: route.params,
        data,
        meta: value.meta,
      },
    ];
  });
  return routeMatches;
}
