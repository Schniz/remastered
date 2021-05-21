import { PluginOption, ResolvedConfig } from "vite";
import path from "path";
import { flatMap } from "lodash";
import globby from "globby";
import * as walk from "acorn-walk";
import MagicString from "magic-string";

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
    return files.map((x) => path.resolve(opts.baseDir, x));
  }

  return {
    name: "remastered:glob-first",
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
          if (file) {
            console.error(`Choosing ${file}`);
            magicString.overwrite(
              n.source.start,
              n.source.end,
              JSON.stringify(file)
            );
          } else {
            const specifiers: string[] = n.specifiers.map(
              (x: any) => `const ${x.local.name} = null;`
            );
            magicString.overwrite(n.start, n.end, specifiers.join(""));
          }
        },
        CallExpression(n: any) {
          if (n.callee.name === "__glob_matches__") {
            const patterns = n.arguments.map((x: any) => x.value);
            const files = matchGlob({ patterns, baseDir, config });
            magicString.overwrite(
              n.start,
              n.end,
              JSON.stringify(files.length > 0)
            );
          }
        },
      });

      return {
        code: magicString.toString(),
        map: magicString.generateMap(),
      };
    },
  };
}
