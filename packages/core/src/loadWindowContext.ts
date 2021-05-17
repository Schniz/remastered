import {
  buildRouteComponentBag,
  RouteDefinition,
} from "./buildRouteComponentBag";
import type { DynamicImportComponentContext } from "./DynamicImportComponent";
import type { LinkTagsContext, ScriptTagsContext } from "./JsxForDocument";
import type { LoaderContext } from "./LoaderContext";
import { mapValues } from "./Map";
import type { HistoryResponseState } from "./NotFoundAndSkipRenderOnServerContext";
import type { MatchesContext } from "./useMatches";

export type Context = {
  loaderContext: React.ContextType<typeof LoaderContext>;
  componentsContext: React.ContextType<typeof DynamicImportComponentContext>;
  historyResponseState: HistoryResponseState;
  links: React.ContextType<typeof LinkTagsContext>;
  scripts: React.ContextType<typeof ScriptTagsContext>;
  matchesContext: React.ContextType<typeof MatchesContext>;
};

export let readyContext: { value?: Context } = {};

export async function loadWindowContext(): Promise<Context> {
  const ctx = __REMASTERED_CTX;
  const historyKey = window.history.state?.key ?? "default";
  const loadCtx = new Map(
    ctx.loadCtx.map(([key, value]) => [`${historyKey}@${key}`, value])
  );
  const loadedRoutes = await buildRouteComponentBag(ctx.ssrRoutes);
  const loadedComponents = mapValues(loadedRoutes, (x) => x.component);
  const matchesContext = new Map(ctx.routeDefs);

  for (const route of loadedRoutes.values()) {
    applyRouteHandlesToCtx(matchesContext, route);
  }

  readyContext.value = {
    links: ctx.linkTags,
    scripts: ctx.scriptTags,
    componentsContext: loadedComponents,
    historyResponseState: new Map([
      [historyKey, ctx.splashState === 404 ? "not_found" : "ok"],
    ]),
    loaderContext: loadCtx,
    matchesContext: matchesContext,
  };

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
  });
}
