import React from "react";
import { DynamicImportComponentContext } from "./DynamicImportComponent";
import { LinkTagsContext, ScriptTagsContext } from "./JsxForDocument";
import { LoaderContext } from "./LoaderContext";
import { NotFoundAndSkipRenderOnServerContext } from "./NotFoundAndSkipRenderOnServerContext";
import {
  SetStatusCodeContext,
  SetStatusCodeProvider,
} from "./SetStatusCodeContext";
import { MatchesContext } from "./useMatches";

export type RemasteredAppContext = {
  loadingErrorContext: React.ContextType<
    typeof NotFoundAndSkipRenderOnServerContext
  >;
  links: React.ContextType<typeof LinkTagsContext>;
  scripts: React.ContextType<typeof ScriptTagsContext>;
  loaderContext: React.ContextType<typeof LoaderContext>;
  loadedComponentsContext: React.ContextType<
    typeof DynamicImportComponentContext
  >;
  matchesContext: React.ContextType<typeof MatchesContext>;
  setStatusCode?: React.ContextType<typeof SetStatusCodeContext>;
  initialUrl?: string;
};

export function WrapWithContext({
  ctx,
  children,
}: {
  ctx: RemasteredAppContext;
  children: React.ReactNode;
}) {
  return (
    <MatchesContext.Provider value={ctx.matchesContext}>
      <ScriptTagsContext.Provider value={ctx.scripts}>
        <LinkTagsContext.Provider value={ctx.links}>
          <NotFoundAndSkipRenderOnServerContext.Provider
            value={ctx.loadingErrorContext}
          >
            <LoaderContext.Provider value={ctx.loaderContext}>
              <SetStatusCodeProvider value={ctx.setStatusCode}>
                <DynamicImportComponentContext.Provider
                  value={ctx.loadedComponentsContext}
                >
                  {children}
                </DynamicImportComponentContext.Provider>
              </SetStatusCodeProvider>
            </LoaderContext.Provider>
          </NotFoundAndSkipRenderOnServerContext.Provider>
        </LinkTagsContext.Provider>
      </ScriptTagsContext.Provider>
    </MatchesContext.Provider>
  );
}
