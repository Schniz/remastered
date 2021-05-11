import React from "react";
import App from "./App";
import { DynamicImportComponentContext } from "./DynamicImportComponent";
import { HaltingRouter } from "./HaltingRouter";
import {
  HistoryResponseState,
  NotFoundAndSkipRenderOnServerContext,
} from "./NotFoundAndSkipRenderOnServerContext";

export function RemasteredApp(props: {
  loaderContext: Map<string, unknown>;
  componentsContext: Map<string, React.ComponentType>;
  historyResponseState: HistoryResponseState;
}) {
  return (
    <NotFoundAndSkipRenderOnServerContext.Provider
      value={{
        state: props.historyResponseState,
      }}
    >
      <DynamicImportComponentContext.Provider value={props.componentsContext}>
        <HaltingRouter
          initialLoaderContext={props.loaderContext}
          loadedComponentContext={props.componentsContext}
        >
          <App />
        </HaltingRouter>
      </DynamicImportComponentContext.Provider>
    </NotFoundAndSkipRenderOnServerContext.Provider>
  );
}
