import React from "react";
import { StaticRouter } from "react-router-dom/server";
import App from "./App";
import { DynamicImportComponentContext } from "./DynamicImportComponent";
import { LinkTagsContext, ScriptTagsContext } from "./JsxForDocument";
import { LoaderContext } from "./LoaderContext";
import { NotFoundAndSkipRenderOnServerContext } from "./NotFoundAndSkipRenderOnServerContext";

export type RemasteredAppServerCtx = {
  loadingErrorContext: React.ContextType<
    typeof NotFoundAndSkipRenderOnServerContext
  >;
  links: React.ContextType<typeof LinkTagsContext>;
  scripts: React.ContextType<typeof ScriptTagsContext>;
  loaderContext: React.ContextType<typeof LoaderContext>;
  requestedUrl: string;
  loadedComponentsContext: React.ContextType<
    typeof DynamicImportComponentContext
  >;
};

export function RemasteredAppServer({ ctx }: { ctx: RemasteredAppServerCtx }) {
  return (
    <ScriptTagsContext.Provider value={ctx.scripts}>
      <LinkTagsContext.Provider value={ctx.links}>
        <NotFoundAndSkipRenderOnServerContext.Provider
          value={ctx.loadingErrorContext}
        >
          <LoaderContext.Provider value={ctx.loaderContext}>
            <DynamicImportComponentContext.Provider
              value={ctx.loadedComponentsContext}
            >
              <StaticRouter location={ctx.requestedUrl}>
                <App />
              </StaticRouter>
            </DynamicImportComponentContext.Provider>
          </LoaderContext.Provider>
        </NotFoundAndSkipRenderOnServerContext.Provider>
      </LinkTagsContext.Provider>
    </ScriptTagsContext.Provider>
  );
}
