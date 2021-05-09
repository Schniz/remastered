import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { DynamicImportComponentContext } from "./DynamicImportComponent";
import { buildRouteComponentBag } from "./buildRouteComponentBag";
import { LoaderContext } from "./LoaderContext";
import { SWRConfig } from "swr";
import { createFetcher } from "./fetcher";

declare global {
  const __REMASTERED_SSR_ROUTES: readonly string[];
  const __REMASTERED_LOAD_CTX: readonly [string, unknown][];
}

const loadCtx = new Map(__REMASTERED_LOAD_CTX);
const fetcher = createFetcher(loadCtx);

buildRouteComponentBag(__REMASTERED_SSR_ROUTES).then((loadedComponents) => {
  ReactDOM.hydrate(
    <React.StrictMode>
      <SWRConfig value={{ fetcher }}>
        <LoaderContext.Provider value={loadCtx}>
          <DynamicImportComponentContext.Provider value={loadedComponents}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </DynamicImportComponentContext.Provider>
        </LoaderContext.Provider>
      </SWRConfig>
    </React.StrictMode>,
    document.getElementById("root")
  );
});
