import React from "react";
import ReactDOM from "react-dom";
import { buildRouteComponentBag } from "./buildRouteComponentBag";
import { HistoryResponseState } from "./NotFoundAndSkipRenderOnServerContext";
import { RemasteredApp } from "./RemasteredApp";

declare global {
  /** SSRd routes we need to preload before first render */
  const __REMASTERED_SSR_ROUTES: readonly string[];

  /** The loading context coming from `loader` functions */
  const __REMASTERED_LOAD_CTX: readonly [string, unknown][];

  /** Information about routes */
  const __REMASTERED_ROUTE_DEFS: readonly [string, { hasLoader: boolean }][];

  /** Should be the status number... crappy name though... */
  const __REMASTERED_SPLASH_STATE: number;

  const __DEV__: boolean;
}

const loadCtx = new Map(__REMASTERED_LOAD_CTX);
const historyResponseState: HistoryResponseState = new Map([
  [
    window.history.state?.key ?? "default",
    __REMASTERED_SPLASH_STATE === 404 ? "not_found" : "ok",
  ],
]);

buildRouteComponentBag(__REMASTERED_SSR_ROUTES).then((loadedComponents) => {
  ReactDOM.hydrate(
    <React.StrictMode>
      <RemasteredApp
        componentsContext={loadedComponents}
        historyResponseState={historyResponseState}
        loaderContext={loadCtx}
      />
    </React.StrictMode>,
    document.getElementById("root")
  );
});
