import { Plugin, ResolvedConfig } from "vite";
import createDebugger from "debug";
import path from "path";

const PLUGIN_NAME = `remastered:redirect-imports`;
const debug = createDebugger(PLUGIN_NAME);

/**
 * Redirects every `/node_modules/remastered/` import
 * to `<projectRoot>/.remastered/` so Vite will think it is
 * a source folder and HMR will work properly.
 */
export function redirectRemasteredImports(): Plugin {
  let config: ResolvedConfig | undefined;
  return {
    name: PLUGIN_NAME,
    enforce: "pre",
    configResolved(given) {
      config = given;
    },
    async resolveId(source, _importer, _options) {
      if (!config) {
        this.error(`Config was not resolved.`);
      }

      const prefix = "/node_modules/remastered/";
      if (!source.startsWith(prefix)) {
        return null;
      }

      const newSource = path.join(
        config.root,
        ".remastered",
        source.slice(prefix.length)
      );
      debug(`Redirected ${source} to ${newSource}`);
      return newSource;
    },
  };
}
