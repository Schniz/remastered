import React from "react";
import App from "./App";
import { DynamicImportComponentContext } from "./DynamicImportComponent";
import { HaltingRouter } from "./HaltingRouter";
import { LinkTagsContext, ScriptTagsContext } from "./JsxForDocument";
import {
  HistoryResponseState,
  NotFoundAndSkipRenderOnServerContext,
} from "./NotFoundAndSkipRenderOnServerContext";
import { MatchesContext } from "./useMatches";

export function RemasteredApp(props: {
  loaderContext: Map<string, unknown>;
  componentsContext: Map<string, React.ComponentType>;
  historyResponseState: HistoryResponseState;
  links: React.ContextType<typeof LinkTagsContext>;
  scripts: React.ContextType<typeof ScriptTagsContext>;
  matchesContext: React.ContextType<typeof MatchesContext>;
}) {
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
