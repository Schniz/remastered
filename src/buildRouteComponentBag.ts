import { routesObject } from "./fsRoutes";
import { LoaderFn } from "./routeTypes";

type RouteDefinition<T> = {
  loader?: LoaderFn<unknown>;
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
        key,
        givenRoute: route,
      });
    });
  await Promise.all(loadedComponents);
  return ctx;
}

export function mapValues<K, V, R>(map: Map<K, V>, f: (v: V) => R): Map<K, R> {
  const newMap = new Map<K, R>();
  for (const [key, value] of map.entries()) {
    newMap.set(key, f(value));
  }
  return newMap;
}

export async function buildRouteComponentBag(
  routeKeys: readonly string[]
): Promise<Map<string, React.ComponentType>> {
  const routeDefinitions = await buildRouteDefinitionBag(
    routeKeys.map((routeKey) => ({ routeKey }))
  );
  return mapValues(routeDefinitions, (x) => x.component);
}
