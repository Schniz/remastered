import { createRouteTreeFromImportGlob } from "./createRouteTreeFromImportGlob";
import {
  RouteObjectWithFilename,
  routeTreeIntoReactRouterRoute,
} from "./routeTreeIntoReactRouterRoute";
import { dynamicImportComponent } from "./DynamicImportComponent";
import type { LoaderFn, MetaFn } from "./routeTypes";

export type RouteFile = {
  /** The renderable React component */
  default?: React.ComponentType;
  /** The data loader, should exist only on back-end code */
  loader?: LoaderFn<unknown>;
  /** Any meta tags/title that the component will add to the mix */
  meta?: MetaFn<unknown>;
  /** A route can export anything using the `handle` named export */
  handle?: unknown;
};

function loadFiles(): Record<string, () => Promise<RouteFile>> {
  const files = import.meta.glob(`/app/routes/**/*.{t,j}sx`);
  return files;
}

function turnToComponentBag(
  files: Record<string, (() => Promise<RouteFile>) | RouteFile>
) {
  const components: Record<string, React.ComponentType> = {};

  for (const key in files) {
    const file = files[key];
    if (typeof file === "function") {
      components[key] = dynamicImportComponent(key, file);
    } else if (typeof file.default === "function") {
      components[key] = file.default;
    }
  }
  return components;
}

export function convertRouteObjectsToRRDef(
  allComponents: Record<string, React.ComponentType>
): RouteObjectWithFilename[] {
  const components = { ...allComponents };
  delete components["/app/routes/404.tsx"];
  delete components["/app/routes/404.jsx"];
  delete components["/app/routes/404.ts"];
  delete components["/app/routes/404.js"];

  const routeTree = createRouteTreeFromImportGlob(components);
  const routes = routeTreeIntoReactRouterRoute(routeTree);

  return routes;
}

export const getRoutesObject = onceOnClient(() => loadFiles());
export const getRouteElements = onceOnClient(() => {
  const componentBag = turnToComponentBag(getRoutesObject());
  return convertRouteObjectsToRRDef(componentBag);
});

function onceOnClient<F extends (...args: any[]) => any>(
  f: F
): (...args: Parameters<F>) => ReturnType<F> {
  if (import.meta.env.SSR) {
    return f;
  } else {
    const v: { value?: ReturnType<F> } = {};
    return (...args): ReturnType<F> => {
      if ("value" in v) {
        return v.value as any;
      }
      v.value = f(...args);
      return v.value as any;
    };
  }
}
