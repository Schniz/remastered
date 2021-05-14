import React from "react";
import { useLocation, matchRoutes } from "react-router";
import { routeElementsObject } from "./fsRoutes";
/* import { RouteMatch } from "react-router"; */

export type RouteDef = { hasLoader: boolean; handle?: unknown };
export const MatchesContext = React.createContext<Map<string, RouteDef>>(
  new Map()
);

export function useMatches(): RouteDef[] {
  const location = useLocation();
  const map = React.useContext(MatchesContext);
  const matched = React.useMemo(() => {
    return matchRoutes(routeElementsObject, location);
  }, [location]);
  const routeMatches = (matched ?? []).flatMap((route: any): RouteDef[] => {
    const value = map.get(route.route.routeFile);
    if (!value) {
      return [];
    }
    return [value];
  });
  return routeMatches;
}
