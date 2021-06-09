import { LoaderFn, ActionFn, LinksFn, HeadersFn, MetaFn } from "./routeTypes";

export type RouteDefinition<T = unknown> = {
  loader?: LoaderFn<unknown>;
  action?: ActionFn;
  meta?: MetaFn;
  links?: LinksFn;
  handle?: unknown;
  component: React.ComponentType;
  headers?: HeadersFn;
  key: string;
  givenRoute: T;
  errorBoundary?: React.ComponentType;
};

export async function buildRouteDefinitionBag<T extends { routeKey: string }>(
  routeKeys: readonly T[],
  routesObject: Record<string, () => Promise<any>>
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
        meta: routeDef.meta,
        key,
        givenRoute: route,
        errorBoundary: routeDef.ErrorBoundary,
      });
    });
  await Promise.all(loadedComponents);
  return ctx;
}

export async function buildRouteComponentBag(
  routeKeys: readonly string[],
  givenRoutesObject: Record<string, () => Promise<any>>
): Promise<Map<string, RouteDefinition>> {
  const routeDefinitions = await buildRouteDefinitionBag(
    routeKeys.map((routeKey) => ({ routeKey })),
    givenRoutesObject
  );
  return routeDefinitions;
}
