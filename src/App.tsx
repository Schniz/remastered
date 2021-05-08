import React from "react";
import { PartialRouteObject } from "react-router";
import { useRoutes } from "react-router-dom";
import Layout from "../app/layout";
import { createRouteTreeFromImportGlob } from "./createRouteTreeFromImportGlob";
import { routeTreeIntoReactRouterRoute } from "./routeTreeIntoReactRouterRoute";

const routeElementsObject = loadFiles();

export default function App() {
  const element = useRoutes([
    {
      element: <Layout />,
      children: routeElementsObject,
    },
  ]);
  return element;
}

function loadFiles(): PartialRouteObject[] {
  const files = import.meta.glob("../app/routes/**/*.tsx");

  const routeTree = createRouteTreeFromImportGlob(files);
  const routes = routeTreeIntoReactRouterRoute(routeTree);

  return routes;
}
