import { createRouteTreeFromImportGlob } from "./createRouteTreeFromImportGlob";
import {
  CustomRouteObject,
  routeTreeIntoReactRouterRoute,
} from "./routeTreeIntoReactRouterRoute";
import { dynamicImportComponent } from "./DynamicImportComponent";

export function loadFilesA() {
  const files = import.meta.glob("../app/routes/**/*.{t,j}sx");
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
  allComponents: Record<string, React.ComponentType>
): CustomRouteObject[] {
  const components = { ...allComponents };
  delete components["../app/routes/404.tsx"];
  delete components["../app/routes/404.jsx"];

  const routeTree = createRouteTreeFromImportGlob(components);
  const routes = routeTreeIntoReactRouterRoute(routeTree);

  return routes;
}

export const routesObject = loadFilesA();
export const componentBag = turnToComponentBag(routesObject);
export const routeElementsObject = convertRouteObjectsToRRDef(componentBag);
