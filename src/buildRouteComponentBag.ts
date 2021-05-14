import { routesObject } from "./fsRoutes";
import { LoaderFn, ActionFn, LinksFn, HeadersFn } from "./routeTypes";
import { mapValues } from "./Map";

export type RouteDefinition<T = unknown> = {
  loader?: LoaderFn<unknown>;
  action?: ActionFn;
  links?: LinksFn;
  handle?: unknown;
  component: React.ComponentType;
  headers?: HeadersFn;
  key: string;
  givenRoute: T;
};

export async function buildRouteDefinitionBag<T extends { routeKey: string }>(
  routeKeys: readonly T[]
) {
  const ctx = new Map<string, RouteDefinition<T>>();
  const loadedComponents = Object.entries(routesObject)
    .flatMap(([key, value]) => {
      const route = routeKeys.find(({ routeKey }) => key === routeKey);
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
        links: routeDef.links,
        handle: routeDef.handle,
        headers: routeDef.headers,
        key,
        givenRoute: route,
      });
    });
  await Promise.all(loadedComponents);
  return ctx;
}

export async function buildRouteComponentBag(
  routeKeys: readonly string[]
): Promise<Map<string, RouteDefinition>> {
  const routeDefinitions = await buildRouteDefinitionBag(
    routeKeys.map((routeKey) => ({ routeKey }))
  );
  return routeDefinitions;
}
