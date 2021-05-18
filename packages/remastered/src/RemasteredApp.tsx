import React from "react";
import App from "./App";
import { DynamicImportComponentContext } from "./DynamicImportComponent";
import { HaltingRouter } from "./HaltingRouter";
import { LinkTagsContext, ScriptTagsContext } from "./JsxForDocument";
import { readyContext } from "./loadWindowContext";
import { NotFoundAndSkipRenderOnServerContext } from "./NotFoundAndSkipRenderOnServerContext";
import { MatchesContext } from "./useMatches";

export function RemasteredApp() {
  const props = readyContext.value;
  if (!props) {
    throw new Error("Context was not loaded!!!");
  }

  return (
    <MatchesContext.Provider value={props.matchesContext}>
      <ScriptTagsContext.Provider
        value={[{ _tag: "eager", contents: "" }, ...props.scripts]}
      >
        <LinkTagsContext.Provider value={props.links}>
          <NotFoundAndSkipRenderOnServerContext.Provider
            value={{
              state: props.historyResponseState,
            }}
          >
            <DynamicImportComponentContext.Provider
              value={props.componentsContext}
            >
              <HaltingRouter
                initialLoaderContext={props.loaderContext}
                loadedComponentContext={props.componentsContext}
              >
                <App />
              </HaltingRouter>
            </DynamicImportComponentContext.Provider>
          </NotFoundAndSkipRenderOnServerContext.Provider>
        </LinkTagsContext.Provider>
      </ScriptTagsContext.Provider>
    </MatchesContext.Provider>
  );
}
