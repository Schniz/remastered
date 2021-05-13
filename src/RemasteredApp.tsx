import React from "react";
import App from "./App";
import { DynamicImportComponentContext } from "./DynamicImportComponent";
import { HaltingRouter } from "./HaltingRouter";
import {
  LinkTag,
  LinkTagsContext,
  ScriptTag,
  ScriptTagsContext,
} from "./JsxForDocument";
import {
  HistoryResponseState,
  NotFoundAndSkipRenderOnServerContext,
} from "./NotFoundAndSkipRenderOnServerContext";

export function RemasteredApp(props: {
  loaderContext: Map<string, unknown>;
  componentsContext: Map<string, React.ComponentType>;
  historyResponseState: HistoryResponseState;
  links: LinkTag[];
  scripts: ScriptTag[];
}) {
  return (
    <ScriptTagsContext.Provider value={props.scripts}>
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
  );
}
