import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { DynamicImportComponentContext } from "./DynamicImportComponent";
import { buildRouteComponentBag } from "./buildRouteComponentBag";
import { HaltingRouter } from "./HaltingRouter";

declare global {
  /** SSRd routes we need to preload before first render */
  const __REMASTERED_SSR_ROUTES: readonly string[];

  /** The loading context coming from `loader` functions */
  const __REMASTERED_LOAD_CTX: readonly [string, unknown][];

  /** Information about routes */
  const __REMASTERED_ROUTE_DEFS: readonly [string, { hasLoader: boolean }][];

  const __DEV__: boolean;
}

const loadCtx = new Map(__REMASTERED_LOAD_CTX);

buildRouteComponentBag(__REMASTERED_SSR_ROUTES).then((loadedComponents) => {
  ReactDOM.hydrate(
    <React.StrictMode>
      <DynamicImportComponentContext.Provider value={loadedComponents}>
        <HaltingRouter
          initialLoaderContext={loadCtx}
          loadedComponentContext={loadedComponents}
        >
          <App />
        </HaltingRouter>
      </DynamicImportComponentContext.Provider>
    </React.StrictMode>,
    document.getElementById("root")
  );
});
