import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { DynamicImportComponentContext } from "./DynamicImportComponent";
import { buildRouteComponentBag } from "./buildRouteComponentBag";
import { LoaderContext } from "./LoaderContext";

declare global {
  const __REMASTERED_SSR_ROUTES: readonly string[];
  const __REMASTERED_LOAD_CTX: readonly [string, unknown][];
}

const loadCtx = new Map(__REMASTERED_LOAD_CTX);

buildRouteComponentBag(__REMASTERED_SSR_ROUTES).then((loadedComponents) => {
  ReactDOM.hydrate(
    <React.StrictMode>
      <LoaderContext.Provider value={loadCtx}>
        <DynamicImportComponentContext.Provider value={loadedComponents}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </DynamicImportComponentContext.Provider>
      </LoaderContext.Provider>
    </React.StrictMode>,
    document.getElementById("root")
  );
});
