import React from "react";
import App from "./App";
import { HaltingRouter } from "./HaltingRouter";
import { readyContext } from "./loadWindowContext";
import { WrapWithContext } from "./WrapWithContext";

export function RemasteredApp() {
  const ctx = readyContext.value;
  if (!ctx) {
    throw new Error("Context was not loaded!!!");
  }

  return (
    <WrapWithContext ctx={ctx}>
      <HaltingRouter
        initialUrl={ctx.initialUrl}
        initialLoaderContext={ctx.loaderContext}
        loadedComponentContext={ctx.loadedComponentsContext}
      >
        <App />
      </HaltingRouter>
    </WrapWithContext>
  );
}
