import React from "react";
import { Layout, Error404 } from "./UserOverridableComponents";
import { ErrorTracker } from "./ErrorTracker";
import {
  RouteObjectWithFilename,
  ClosestRouteContext,
} from "./routeTreeIntoReactRouterRoute";
import { LAYOUT_ROUTE_KEY } from "./magicConstants";

/** Wrap routes in Layout and ErrorTracker */
export function wrapRoutes(
  routes: RouteObjectWithFilename[]
): RouteObjectWithFilename[] {
  const layoutRoute: RouteObjectWithFilename = {
    path: "/",
    caseSensitive: false,
    routeFile: LAYOUT_ROUTE_KEY,
    element: <Layout />,
    children: [
      {
        path: "/",
        caseSensitive: false,
        element: <ErrorTracker />,
        children: [
          ...routes,
          { caseSensitive: false, path: "*", element: <Error404 /> },
        ],
      },
    ],
  };

  layoutRoute.element = (
    <ClosestRouteContext.Provider value={layoutRoute}>
      {layoutRoute.element}
    </ClosestRouteContext.Provider>
  );

  return [layoutRoute];
}
