import { Plugin } from "vite";
import createDebugger from "debug";
import path from "path";
import tempy from "tempy";
import fs from "fs-extra";

const PLUGIN_NAME = `remastered:redirect-imports`;
const debug = createDebugger(PLUGIN_NAME);

/**
 * Redirects every `/node_modules/remastered/` import
 * to `<projectRoot>/.remastered/` so Vite will think it is
 * a source folder and HMR will work properly.
 */
export function redirectRemasteredImports(): Plugin {
  const tempDirectory = tempy.file();

  return {
    name: PLUGIN_NAME,
    enforce: "pre",
    async buildStart() {
      await symlinkToDirectory(tempDirectory);
    },
    async resolveId(source, _importer, _options) {
      const prefix = "/node_modules/remastered/";
      if (!source.startsWith(prefix)) {
        return null;
      }

      const newSource = path.join(tempDirectory, source.slice(prefix.length));
      debug(`Redirected ${source} to ${newSource}`);
      return newSource;
    },
  };
}

async function symlinkToDirectory(tempDirectory: string) {
  const realpath = path.dirname(require.resolve("remastered/package.json"));
  await fs.ensureSymlink(realpath, tempDirectory);
}
