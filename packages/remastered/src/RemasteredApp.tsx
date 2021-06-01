import React from "react";
import App from "./App";
import { HaltingRouter } from "./HaltingRouter";
import { readyContext } from "./loadWindowContext";
import { RemasteredAppServerCtx, WrapWithContext } from "./WrapWithContext";

export function RemasteredApp() {
  const props = readyContext.value;
  if (!props) {
    throw new Error("Context was not loaded!!!");
  }

  const ctx: RemasteredAppServerCtx = {
    scripts: [{ _tag: "eager", contents: "" }, ...props.scripts],
    loaderContext: props.loaderContext,
    loadedComponentsContext: props.componentsContext,
    links: props.links,
    matchesContext: props.matchesContext,
    loadingErrorContext: props.historyResponseState,
  };

  return (
    <WrapWithContext ctx={ctx}>
      <HaltingRouter
        initialLoaderContext={props.loaderContext}
        loadedComponentContext={props.componentsContext}
      >
        <App />
      </HaltingRouter>
    </WrapWithContext>
  );
}
