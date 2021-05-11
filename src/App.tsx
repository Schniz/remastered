import React from "react";
import { useRoutes } from "react-router-dom";
import Layout from "../app/layout";
import { ErrorTracker } from "./ErrorTracker";
import { Error404 } from "./Error404";
import { routeElementsObject } from "./fsRoutes";

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
