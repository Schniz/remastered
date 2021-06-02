import { RouteTree } from "./createRouteTreeFromImportGlob";
import React from "react";
import { Outlet, RouteObject } from "react-router";

export function useRouteModule(): string {
  return useClosestRoute()?.routeFile!;
}

export function useClosestRoute(): RouteObjectWithFilename | null {
  return React.useContext(ClosestRouteContext);
}

export const ClosestRouteContext =
  React.createContext<RouteObjectWithFilename | null>(null);

export function routeTreeIntoReactRouterRoute(
  routeTree: RouteTree
): RouteObjectWithFilename[] {
  const routes: RouteObjectWithFilename[] = [];

  for (const key in routeTree) {
    const branch = routeTree[key];
    const Element = branch.element ?? Outlet;
    const route: RouteObjectWithFilename = {
      element: <Element />,
      caseSensitive: true,
      path: key,
      children: routeTreeIntoReactRouterRoute(branch.children),
      routeFile: branch.filepath,
      hadElement: !!branch.element,
    };
    route.element = (
      <ClosestRouteContext.Provider value={route}>
        <Element />
      </ClosestRouteContext.Provider>
    );
    routes.push(route);
  }

  return routes;
}

export type RouteObjectWithFilename = RouteObject & {
  hadElement: boolean;
  routeFile?: string;
};
