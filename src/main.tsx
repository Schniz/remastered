import "vite/dynamic-import-polyfill";
import React from "react";
import ReactDOM from "react-dom";
import {
  buildRouteComponentBag,
  RouteDefinition,
} from "./buildRouteComponentBag";
import type { HistoryResponseState } from "./NotFoundAndSkipRenderOnServerContext";
import { RemasteredApp } from "./RemasteredApp";
import type { AllLinkTags, ScriptTag } from "./JsxForDocument";
import type { MatchesContext, RouteDef } from "./useMatches";
import { mapValues } from "./Map";

declare global {
  /** SSRd routes we need to preload before first render */
  const __REMASTERED_SSR_ROUTES: readonly string[];

  /** The loading context coming from `loader` functions */
  const __REMASTERED_LOAD_CTX: readonly [string, unknown][];

  /** Information about routes */
  const __REMASTERED_ROUTE_DEFS: readonly [string, RouteDef][];

  /** Should be the status number... crappy name though... */
  const __REMASTERED_SPLASH_STATE: number;

  /** Link tags */
  const __REMASTERED_LINK_TAGS: AllLinkTags[];

  /** Link tags */
  const __REMASTERED_SCRIPT_TAGS: ScriptTag[];

  const __DEV__: boolean;
}

/**
 * I think Vimium is adding a script tag to my HTML.
 * Drivin me craaaaaaaazy!
 */
document
  .querySelectorAll(`html > script[src^='chrome-extension://']`)
  .forEach((x) => x.remove());

const historyKey = window.history.state?.key ?? "default";
const loadCtx = new Map(
  __REMASTERED_LOAD_CTX.map(([key, value]) => [`${historyKey}@${key}`, value])
);
const historyResponseState: HistoryResponseState = new Map([
  [historyKey, __REMASTERED_SPLASH_STATE === 404 ? "not_found" : "ok"],
]);

function applyRouteHandlesToCtx(
  ctx: React.ContextType<typeof MatchesContext>,
  routeDefinition: RouteDefinition
) {
  ctx.set(routeDefinition.key, {
    hasLoader: false,
    ...ctx.get(routeDefinition.key),
    handle: routeDefinition.handle,
  });
}

buildRouteComponentBag(__REMASTERED_SSR_ROUTES).then((loadedRoutes) => {
  const loadedComponents = mapValues(loadedRoutes, (x) => x.component);
  const matchesContext = new Map(__REMASTERED_ROUTE_DEFS);
  for (const route of loadedRoutes.values()) {
    applyRouteHandlesToCtx(matchesContext, route);
  }

  ReactDOM.hydrate(
    // @ts-expect-error
    <React.StrictMode>
      <RemasteredApp
        links={__REMASTERED_LINK_TAGS}
        scripts={__REMASTERED_SCRIPT_TAGS}
        componentsContext={loadedComponents}
        historyResponseState={historyResponseState}
        loaderContext={loadCtx}
        matchesContext={matchesContext}
      />
    </React.StrictMode>,
    document
  );
});
