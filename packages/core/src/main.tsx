import React from "react";
import ReactDOM from "react-dom";
import { RemasteredApp } from "./RemasteredApp";
import type { AllLinkTags, ScriptTag } from "./JsxForDocument";
import type { RouteDef } from "./useMatches";
import { loadWindowContext } from "./loadWindowContext";

declare global {
  const __REMASTERED_CTX: {
    /** SSRd routes we need to preload before first render */
    ssrRoutes: readonly string[];

    /** The loading context coming from `loader` functions */
    loadCtx: readonly [string, unknown][];

    /** Information about routes */
    routeDefs: readonly [string, RouteDef][];

    /** Should be the status number... crappy name though... */
    splashState: number;

    /** Link tags */
    linkTags: AllLinkTags[];

    /** Link tags */
    scriptTags: ScriptTag[];
  };

  const __DEV__: boolean;
}

/**
 * I think Vimium is adding a script tag to my HTML.
 * Drivin me craaaaaaaazy!
 */
document
  .querySelectorAll(`html > script[src^='chrome-extension://']`)
  .forEach((x) => x.remove());

loadWindowContext().then(() => {
  const customEntry = Object.values(
    import.meta.globEager(`/app/entry.client.{j,t}s{,x}`)
  )[0];
  if (!customEntry) {
    ReactDOM.hydrate(
      <React.StrictMode>
        <RemasteredApp />
      </React.StrictMode>,
      document
    );
  } else {
    customEntry.entry();
  }
});
