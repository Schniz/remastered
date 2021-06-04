import {
  buildRouteComponentBag,
  RouteDefinition,
} from "./buildRouteComponentBag";
import { getRoutesObject } from "./fsRoutes";
import { LAYOUT_ROUTE_KEY } from "./magicConstants";
import { mapValues } from "./Map";
import type { MatchesContext } from "./useMatches";
import { LayoutObject } from "./UserOverridableComponents";
import type { RemasteredAppContext } from "./WrapWithContext";

declare global {
  interface Window {
    $$remasteredCtx?: { value?: RemasteredAppContext };
  }
}

export let readyContext: { value?: RemasteredAppContext } =
  import.meta.env.SSR || import.meta.env.PROD
    ? {}
    : window.$$remasteredCtx ?? {};

export async function loadWindowContext(): Promise<RemasteredAppContext> {
  const ctx = __REMASTERED_CTX;
  const historyKey = window.history.state?.key ?? "default";
  const loadCtx = new Map(
    ctx.loadCtx.map(([key, value]) => [`${historyKey}@${key}`, value])
  );
  const loadedRoutes = await buildRouteComponentBag(ctx.ssrRoutes, {
    ...getRoutesObject(),
    [LAYOUT_ROUTE_KEY]: async () => LayoutObject,
  });
  const loadedComponents = mapValues(loadedRoutes, (x) => ({
    component: x.component,
    errorBoundary: x.errorBoundary,
  }));
  const matchesContext = new Map(ctx.routeDefs);

  for (const route of loadedRoutes.values()) {
    applyRouteHandlesToCtx(matchesContext, route);
  }

  readyContext.value = {
    links: ctx.linkTags,
    scripts: [{ _tag: "eager", contents: "" }, ...ctx.scriptTags],
    loadedComponentsContext: loadedComponents,
    loadingErrorContext: new Map([
      [historyKey, ctx.splashState === 404 ? "not_found" : "ok"],
    ]),
    loaderContext: loadCtx,
    matchesContext: matchesContext,
  };

  if (!(import.meta.env.SSR || import.meta.env.PROD)) {
    window.$$remasteredCtx = readyContext;
  }

  return readyContext.value;
}

function applyRouteHandlesToCtx(
  ctx: React.ContextType<typeof MatchesContext>,
  routeDefinition: RouteDefinition
) {
  ctx.set(routeDefinition.key, {
    hasLoader: false,
    ...ctx.get(routeDefinition.key),
    handle: routeDefinition.handle,
    meta: routeDefinition.meta,
    errorBoundary: routeDefinition.errorBoundary,
  });
}
