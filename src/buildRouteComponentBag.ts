import { routesObject } from "./fsRoutes";
import { LoaderFn, ActionFn } from "./routeTypes";
import { mapValues } from "./Map";

type RouteDefinition<T> = {
  loader?: LoaderFn<unknown>;
  action?: ActionFn;
  component: React.ComponentType;
  key: string;
  givenRoute: T;
};

export async function buildRouteDefinitionBag<T extends { routeKey: string }>(
  routeKeys: readonly T[]
) {
  const ctx = new Map<string, RouteDefinition<T>>();
  const loadedComponents = Object.entries(routesObject)
    .flatMap(([key, value]) => {
      const shortKey = key.replace("../app/routes/", "");
      const route = routeKeys.find(({ routeKey }) => shortKey === routeKey);
      if (route) {
        return [{ route, value, key }];
      }
      return [];
    })
    .map(async ({ route, value, key }) => {
      const routeDef = await value();
      ctx.set(key, {
        component: routeDef.default,
        loader: routeDef.loader,
        action: routeDef.action,
        key,
        givenRoute: route,
      });
    });
  await Promise.all(loadedComponents);
  return ctx;
}

export async function buildRouteComponentBag(
  routeKeys: readonly string[]
): Promise<Map<string, React.ComponentType>> {
  const routeDefinitions = await buildRouteDefinitionBag(
    routeKeys.map((routeKey) => ({ routeKey }))
  );
  return mapValues(routeDefinitions, (x) => x.component);
}
