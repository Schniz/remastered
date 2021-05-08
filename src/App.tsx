import React from "react";
import { PartialRouteObject } from "react-router";
import { useRoutes } from "react-router-dom";
import Layout from "../app/layout";

const routeElementsObject = loadFiles();

export default function App() {
  const routes = React.useMemo<PartialRouteObject[]>(() => {
    const partials: PartialRouteObject[] = [];
    for (const route in routeElementsObject) {
      const Component = routeElementsObject[route];
      partials.push({ path: route, element: <Component /> });
    }
    return [
      {
        path: "/*",
        element: <Layout />,
        children: partials,
      },
    ];
  }, [routeElementsObject]);
  const element = useRoutes(routes);

  return element;
}

function loadFiles(): Record<string, React.ComponentType> {
  const files = import.meta.glob("../app/routes/**/*.tsx");
  const routes: Record<string, React.ComponentType> = {};

  for (const filename in files) {
    const path = filename
      .replace(/^\.\.\/app\/routes/, "")
      .replace(/\.[tj]sx?$/, "")
      .replace(/@/, ":")
      .replace(/\/index$/, "/");
    routes[path] = React.lazy(files[filename] as any);
  }

  console.log(routes);
  return routes;
}
