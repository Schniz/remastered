import { RouteTree } from "./createRouteTreeFromImportGlob";
import React from "react";
import { Outlet, RouteObject } from "react-router";

export const RouteKeyContext = React.createContext<string | undefined>(
  undefined
);

export function routeTreeIntoReactRouterRoute(
  routeTree: RouteTree
): CustomRouteObject[] {
  const routes: CustomRouteObject[] = [];

  for (const key in routeTree) {
    const branch = routeTree[key];
    const Element = branch.element ?? Outlet;
    const element = (
      <RouteKeyContext.Provider value={`../app/routes/${branch.filepath}`}>
        <Element />
      </RouteKeyContext.Provider>
    );
    routes.push({
      caseSensitive: true,
      path: key,
      element,
      children: routeTreeIntoReactRouterRoute(branch.children),
      routeFile: branch.filepath,
    });
  }

  return routes;
}

export type CustomRouteObject = RouteObject & {
  routeFile?: string;
};
