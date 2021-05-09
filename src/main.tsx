import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { DynamicImportComponentContext } from "./DynamicImportComponent";
import { buildRouteComponentBag } from "./buildRouteComponentBag";

declare global {
  const __REMASTERED_SSR_ROUTES: readonly string[];
}

buildRouteComponentBag(__REMASTERED_SSR_ROUTES).then((loadedComponents) => {
  ReactDOM.hydrate(
    <React.StrictMode>
      <DynamicImportComponentContext.Provider value={loadedComponents}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </DynamicImportComponentContext.Provider>
    </React.StrictMode>,
    document.getElementById("root")
  );
});
