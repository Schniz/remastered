import { PluginOption, ResolvedConfig } from "vite";
import path from "path";
import { flatMap } from "lodash";
import globby from "globby";
import createDebugger from "debug";

const PLUGIN_NAME = `remastered:glob-first`;
const debug = createDebugger(PLUGIN_NAME);

/**
 * Adds the `import A from 'glob-first:/app/*.ts'`
 * import hook
 */
export function globFirst(): PluginOption {
  let resolvedConfig: ResolvedConfig | undefined;

  function matchGlob(opts: {
    patterns: string[];
    config: ResolvedConfig;
    baseDir: string;
  }): string[] {
    const patterns = opts.patterns.map((pattern) => {
      if (path.isAbsolute(pattern)) {
        return path.join(opts.config.root, pattern.slice(1));
      }
      return pattern;
    });
    const files = flatMap(patterns, (pattern) => {
      return globby.sync(pattern, { cwd: opts.baseDir });
    });
    return files.map((x) => path.resolve(opts.baseDir, x));
  }

  return {
    name: PLUGIN_NAME,
    enforce: "pre",
    configResolved(given) {
      resolvedConfig = given;
    },
    resolveId(source, importer) {
      if (!source.startsWith("glob-first:")) return null;
      if (!resolvedConfig) return null;
      const matches = source.match(/^glob-first:(.+)$/);
      if (!matches) {
        return null;
      }
      const baseDir = path.dirname(importer ?? resolvedConfig.root);
      let [, pattern] = matches;
      const patterns = pattern.split(";");
      const [file] = matchGlob({
        patterns,
        baseDir,
        config: resolvedConfig,
      });

      if (!file) {
        this.error(
          `Can't match the glob patterns ${JSON.stringify(
            patterns
          )} on ${baseDir}`
        );
      }

      debug(
        `Patterns ${JSON.stringify(patterns)} resolved into ${JSON.stringify(
          file
        )}`
      );

      return file;
    },
  };
}
