import { PluginOption, ResolvedConfig } from "vite";
import path from "path";
import { flatMap } from "lodash";
import globby from "globby";
import * as walk from "acorn-walk";
import MagicString from "magic-string";
import createDebugger from "debug";

const PLUGIN_NAME = `remastered:glob-first`;
const debug = createDebugger(PLUGIN_NAME);

type ReplacableImport = {
  start: number;
  end: number;
  pattern: string;
  resolved?: string;
};

/**
 * Adds the `__glob_matches__` function
 * and `import A from 'glob-first:/app/*.ts'`
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
    return files
      .map((x) => path.resolve(opts.baseDir, x))
      .map((x) => {
        let relative = path.relative(opts.baseDir, x);
        if (relative.charAt(0) === ".") {
          return relative;
        }
        return `./${relative}`;
      });
  }

  return {
    name: PLUGIN_NAME,
    enforce: "pre",
    configResolved(given) {
      resolvedConfig = given;
    },
    async transform(code, importer) {
      if (!resolvedConfig) {
        this.error(`Config was not resolved yet.`);
      }
      const config = resolvedConfig;

      if (!code.includes("glob-first:")) {
        return;
      }

      const magicString = new MagicString(code);
      const baseDir = path.dirname(importer);

      const node = this.parse(code);
      const replacableImports: ReplacableImport[] = [];
      walk.simple(node, {
        ImportDeclaration(n: any) {
          const matches = n.source.value.match(/^glob-first:(.+)$/);
          if (!matches) {
            return;
          }
          let [, pattern] = matches;
          const patterns = pattern.split(";");
          const files = matchGlob({
            patterns,
            baseDir,
            config,
          });
          const [file] = files;
          replacableImports.push({
            start: n.source.start,
            end: n.source.end,
            pattern: pattern,
            resolved: file,
          });
        },
      });

      for (const replacable of replacableImports) {
        if (!replacable.resolved) {
          this.error(
            `No file was found for pattern ${JSON.stringify(
              replacable.pattern
            )}\nFrom context: ${baseDir}`
          );
        }

        debug(
          `Pattern ${JSON.stringify(
            replacable.pattern
          )} resolved into ${JSON.stringify(replacable.resolved)}`
        );

        magicString.overwrite(
          replacable.start,
          replacable.end,
          JSON.stringify(replacable.resolved)
        );
      }

      return {
        code: magicString.toString(),
        map: magicString.generateMap(),
      };
    },
  };
}
