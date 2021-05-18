import React from "react";
import { useRoutes } from "react-router-dom";
import { ErrorTracker } from "./ErrorTracker";
import { routeElementsObject } from "./fsRoutes";
import { Layout, Error404 } from "./UserOverridableComponents";

export default function App() {
  const element = useRoutes([
    {
      element: <Layout />,
      children: [
        {
          element: <ErrorTracker />,
          children: [
            ...routeElementsObject,
            { path: "*", element: <Error404 /> },
          ],
        },
      ],
    },
  ]);
  return element;
}
