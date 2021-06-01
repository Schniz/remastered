import { RemasteredApp } from "./RemasteredAppClient";
import type { AllLinkTags, ScriptTag } from "./JsxForDocument";
import type { RouteDef } from "./useMatches";
import { loadWindowContext } from "./loadWindowContext";
import renderClientEntry from "glob-first:/app/entry.client.{t,j}s{x,};./defaultClientEntry.js";

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
  return renderClientEntry({ Component: RemasteredApp });
});
