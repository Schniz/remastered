import { routesObject } from "./App";

export async function buildRouteComponentBag(
  routeKeys: readonly string[]
): Promise<Map<string, React.ComponentType>> {
  const ctx = new Map<string, React.ComponentType>();
  const loadedComponents = Object.entries(routesObject)
    .filter(([key]) => {
      return routeKeys.includes(key.replace("../app/routes/", ""));
    })
    .map(async ([key, value]) => {
      const component = await value();
      ctx.set(key, component.default);
    });
  await Promise.all(loadedComponents);
  return ctx;
}
