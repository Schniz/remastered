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

const identifierRegexPattern = "[a-zA-Z_][a-zA-Z0-9_]*";

export function formatRoutePath(key: string): string {
  const strippedName = key
    .replace(/\.[tj]sx?$/, "")
    // Next.js' `[...splat]` => Remastered `@_splat_`
    .replace(
      new RegExp(`\\[\\.\\.\\.${identifierRegexPattern}\\]`, "g"),
      "@_splat_"
    )
    // Next.js' `[param]` => Remastered `@param`
    .replace(new RegExp(`\\[(${identifierRegexPattern})\\]`, "g"), "@$1")
    // Turning `@_splat_`, which is a magic filename for `*`
    .replace(/@_splat_/, "*")
    // @[a-z] => :[a-z]
    // @@ => @
    .replace(/(@@|@([a-z]))/g, (search, _replaceValue, letter?: string) => {
      if (letter) {
        return `:${letter}`;
      }
      return search.slice(1);
    })
    .replace(/\~/g, "/");
  let newKey = `/${strippedName}`;
  if (newKey === "/index") {
    newKey = "/";
  }
  return newKey;
}

function replaceDots(rt: RouteTree): RouteTree {
  const newRouteTree: RouteTree = {};

  for (const key in rt) {
    const strippedName = formatRoutePath(key);

    newRouteTree[strippedName] = {
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
