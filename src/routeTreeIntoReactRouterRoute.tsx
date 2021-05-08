import { RouteTree } from "./createRouteTreeFromImportGlob";
import React from "react";
import { Outlet, PartialRouteObject } from "react-router";

export function routeTreeIntoReactRouterRoute(
  routeTree: RouteTree
): PartialRouteObject[] {
  const routes: PartialRouteObject[] = [];

  for (const key in routeTree) {
    const { children, element } = routeTree[key];
    const Element = element ?? Outlet;
    routes.push({
      path: key,
      element: <Element />,
      children: routeTreeIntoReactRouterRoute(children),
    });
  }

  return routes;
}
