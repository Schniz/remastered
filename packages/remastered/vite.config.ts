import { defineConfig, PluginOption, ResolvedConfig } from "vite";
import { Module, parse, print } from "@swc/core";
import reactRefresh from "@vitejs/plugin-react-refresh";
import path from "path";
import fs from "fs-extra";
import globby from "globby";
import walk from "acorn-walk";
import MagicString from "magic-string";

export function fileInCore(name: string): string {
  return path.join(process.cwd(), "node_modules/.remastered", name);
}

const symlinkDir = fileInCore("");
fs.removeSync(symlinkDir);
fs.outputFileSync(
  path.join(symlinkDir, "entry.client.js"),
  `import 'remastered/dist/main';`
);
fs.outputFileSync(
  path.join(symlinkDir, "entry.server.js"),
  `export * from 'remastered/dist/entry-server';`
);

// https://vitejs.dev/config/
const config = defineConfig({
  plugins: [globFirst(), routeTransformer(), reactRefresh()],
  define: {
    __DEV__: process.env.NODE_ENV !== "production",
  },
  build: {
    rollupOptions: {
      input: fileInCore("entry.client.js"),
    },
  },
  optimizeDeps: {
    include: [
      "react-router",
      "react-router-dom",
      "react",
      "react-dom",
      "lodash",
      "@vitejs/plugin-react-refresh",
    ],
    exclude: ["remastered"],
  },
  ...({
    ssr: {
      noExternal: ["remastered"],
    },
  } as any),
});

export default config;

/**
 * Removes all the `export const ...` from routes, so it won't use server side stuff in client side
 */
function routeTransformer(): PluginOption {
  const modulePrefix = path.join(process.cwd(), "./app/routes/");
  const acceptSelfCode = `
    ;if (import.meta.hot) {
      import.meta.hot.accept();
    }
  `;

  return {
    enforce: "pre",
    name: "remaster:route",
    async transform(code, id, ssr) {
      if (ssr) return null;
      if (!id.startsWith(modulePrefix)) {
        return null;
      }
      if (!/\.(t|j)sx?$/.test(id)) {
        return null;
      }

      const body: Module["body"] = [];

      const parsed = await parse(code, { syntax: "typescript", tsx: true });

      for (const item of parsed.body) {
        if (item.type !== "ExportDeclaration") {
          body.push(item);
        } else if (item.declaration.type === "VariableDeclaration") {
          const declarations = item.declaration.declarations.filter(
            (declaration) => {
              return (
                declaration.id.type === "Identifier" &&
                ["handle", "meta"].includes(declaration.id.value)
              );
            }
          );
          if (declarations.length) {
            body.push({
              ...item,
              declaration: {
                ...item.declaration,
                declarations,
              },
            });
          }
        }
      }

      const result = await print({ ...parsed, body });
      result.code = result.code + acceptSelfCode;
      return result;
    },
  };
}

/**
 * Adds the `__glob_matches__` function
 * and `import A from 'glob-first:/app/*.ts'`
 */
function globFirst(): PluginOption {
  let config: ResolvedConfig | undefined;

  function matchGlob(opts: {
    pattern: string;
    config: ResolvedConfig;
    baseDir: string;
  }): string[] {
    let pattern = opts.pattern;
    if (path.isAbsolute(pattern)) {
      pattern = path.join(config.root, pattern.slice(1));
    }
    const files = globby.sync(pattern, { cwd: opts.baseDir });
    return files;
  }

  return {
    name: "remastered:glob-first",
    enforce: "pre",
    configResolved(given) {
      config = given;
    },
    async transform(code, importer) {
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
          const [file] = matchGlob({ pattern, baseDir, config });
          if (file) {
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
            const pattern = n.arguments[0].value;
            const files = matchGlob({ pattern, baseDir, config });
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
