import React from "react";

export function createRouteTreeFromImportGlob(
  record: Record<string, () => Promise<unknown>>
): RouteTree {
  const routes: Record<string, React.ComponentType> = {};

  for (const filename in record) {
    const path = filename
      .replace(/^\.\.\/app\/routes\//, "")
      .replace(/\.[tj]sx?$/, "")
      .replace(/@/, ":");

    routes[path] = React.lazy(record[filename] as any);
  }

  const routeTree: Leaf = { children: {} };

  for (const path in routes) {
    const element = routes[path];
    const parts = path.split("/");
    const relevant = parts.reduce((obj, part) => {
      const currentObject = obj.children[part] ?? { children: {} };
      obj.children[part] = currentObject;
      return currentObject;
    }, routeTree);
    relevant.element = element;
  }

  return replaceDots(routeTree.children);
}

function replaceDots(rt: RouteTree): RouteTree {
  const newRouteTree: RouteTree = {};

  for (const key in rt) {
    let newKey = `/${key.replace(/\./g, "/")}`;
    if (newKey === "/index") {
      newKey = "/";
    }

    newRouteTree[newKey] = {
      ...rt[key],
      children: replaceDots(rt[key].children),
    };
  }

  return newRouteTree;
}

export type RouteTree = Record<string, Leaf>;
type Leaf = { children: RouteTree; element?: React.ComponentType };
