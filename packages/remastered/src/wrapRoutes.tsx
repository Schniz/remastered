import React from "react";
import { Layout, Error404 } from "./UserOverridableComponents";
import { ErrorTracker } from "./ErrorTracker";
import { RouteObjectWithFilename } from "./routeTreeIntoReactRouterRoute";
import { LAYOUT_ROUTE_KEY } from "./magicConstants";

/** Wrap routes in Layout and ErrorTracker */
export function wrapRoutes(
  routes: RouteObjectWithFilename[]
): RouteObjectWithFilename[] {
  return [
    {
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
    },
  ];
}
