import React from "react";
import { RouteObject } from "react-router";
import { useRoutes } from "react-router-dom";
import Layout from "../app/layout";
import { createRouteTreeFromImportGlob } from "./createRouteTreeFromImportGlob";
import { routeTreeIntoReactRouterRoute } from "./routeTreeIntoReactRouterRoute";
import { dynamicImportComponent } from "./DynamicImportComponent";

export const routesObject = loadFilesA();
export const componentBag = turnToComponentBag(routesObject);
export const routeElementsObject = convertRouteObjectsToRRDef(componentBag);

export default function App() {
  const element = useRoutes([
    {
      element: <Layout />,
      children: routeElementsObject,
    },
  ]);
  return element;
}

export function loadFilesA() {
  const files = import.meta.glob("../app/routes/**/*.tsx");
  return files;
}

function turnToComponentBag(files: Record<string, () => Promise<unknown>>) {
  const components: Record<string, React.ComponentType> = {};

  for (const key in files) {
    const file = files[key] as { default: any } | (() => unknown);
    components[key] =
      typeof file === "function"
        ? dynamicImportComponent(key, file as any)
        : file.default;
  }
  return components;
}

export function convertRouteObjectsToRRDef(
  components: Record<string, React.ComponentType>
): RouteObject[] {
  const routeTree = createRouteTreeFromImportGlob(components);
  const routes = routeTreeIntoReactRouterRoute(routeTree);

  return routes;
}
