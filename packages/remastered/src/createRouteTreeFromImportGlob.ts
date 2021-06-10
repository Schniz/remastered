import React from "react";

export function createRouteTreeFromImportGlob(
  record: Record<string, React.ComponentType>
): RouteTree {
  const routes: Record<
    string,
    { filename: string; component: React.ComponentType }
  > = {};

  for (const filename in record) {
    const path = filename.replace(/^\/app\/routes\//, "");
    routes[path] = { filename, component: record[filename] };
  }

  const routeTree: Leaf = { children: {}, filepath: "" };

  for (const path in routes) {
    const { component: element, filename } = routes[path];
    const parts = path.replace(/\.[tj]sx?$/, "").split("/");
    const relevant = parts.reduce((obj, part) => {
      const currentObject = obj.children[part] ?? {
        children: {},
      };
      obj.children[part] = currentObject;
      return currentObject;
    }, routeTree);
    relevant.filepath = filename;
    relevant.element = element;
  }

  return replaceDots(routeTree.children);
}

function replaceDots(rt: RouteTree): RouteTree {
  const newRouteTree: RouteTree = {};

  for (const key in rt) {
    const strippedName = key
      .replace(/\.[tj]sx?$/, "")
      .replace(/@/g, ":")
      .replace(/@/, ":")
      .replace(/\~/g, "/");
    let newKey = `/${strippedName}`;
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
type Leaf = {
  children: RouteTree;
  filepath?: string;
  element?: React.ComponentType;
};
