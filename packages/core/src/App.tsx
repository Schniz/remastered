import React from "react";
import { useRoutes } from "react-router-dom";
import { ErrorTracker } from "./ErrorTracker";
import { Error404 } from "./Error404";
import { routeElementsObject } from "./fsRoutes";

const UserLayout = Object.values(
  import.meta.globEager("/app/layout.{t,j}sx")
)[0].default;

export default function App() {
  const element = useRoutes([
    {
      element: <UserLayout />,
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
