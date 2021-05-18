import React from "react";
import { useRoutes } from "react-router-dom";
import { ErrorTracker } from "./ErrorTracker";
import { Error404 } from "./Error404";
import { routeElementsObject } from "./fsRoutes";
import CustomLayout from "glob-first:/app/layout.{t,j}s{x,}";
import { DefaultLayout } from "./DefaultLayout";

const UserLayout = __glob_matches__("/app/layout.{t,j}s{x,}")
  ? CustomLayout
  : DefaultLayout;

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
