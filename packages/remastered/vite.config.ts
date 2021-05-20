import {
  defineConfig,
  ModuleNode,
  PluginOption,
  ResolvedConfig,
  ViteDevServer,
} from "vite";
import { Module, parse, print } from "@swc/core";
import reactRefresh from "@vitejs/plugin-react-refresh";
import path from "path";
import fs from "fs-extra";
import globby from "globby";
import walk from "acorn-walk";
import MagicString from "magic-string";
import flatMap from "lodash/flatMap";

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
  plugins: [
    globFirst(),
    ...routeTransformers(),
    nodePolyfill(),
    globHmrListener(),
    reactRefresh(),
  ],
  define: {
    __DEV__: process.env.NODE_ENV !== "production",
    "process.env.REMASTER_PROJECT_DIR": JSON.stringify(
      process.env.REMASTER_PROJECT_DIR
    ),
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
function routeTransformers(): PluginOption[] {
  const modulePrefix = path.join(process.cwd(), "./app/routes/");
  const acceptSelfCode = `
    ;if (import.meta.hot) {
      import.meta.hot.accept(() => {
        // accepting self...
      });
    }
  `;
  let server: ViteDevServer | undefined;

  return [
    {
      enforce: "pre",
      name: "remaster:route",
      configureServer(given) {
        server = given;
      },
      load(id) {
        if (!id.startsWith(modulePrefix)) {
          return null;
        }
        if (!/\.(t|j)sx?$/.test(id)) {
          return null;
        }

        const contents = fs.readFileSync(id, "utf8");
        return contents + acceptSelfCode;
      },
      async transform(code, id, ssr) {
        if (ssr) return null;
        if (!id.startsWith(modulePrefix)) {
          return null;
        }
        if (!/\.(t|j)sx?$/.test(id)) {
          return null;
        }

        const body: Module["body"] = [];

        const parsed = await parse(code, {
          syntax: "typescript",
          tsx: true,
          dynamicImport: true,
          target: "es2020",
        });

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
        result.code = result.code;
        return result;
      },
      async handleHotUpdate(ctx) {
        // const isRouteFile = ctx.modules.some((mod) =>
        //   isRouteModule(mod, modulePrefix)
        // );
        // console.log({ isRouteFile });
        // if (isRouteFile) {
        ctx.server.ws.send({
          type: "custom",
          event: "remastered:server-module-updated",
          data: {},
        });
        // }
      },
    },
    {
      name: "remastered:post-route-modifiers",
      enforce: "post",
      buildEnd() {
        console.log("EEEEEEEENDDDDDDDDDDDD");
      },
      // transform(_code, id, _ssr) {
      //   if (!id.includes("/app/")) {
      //     return null;
      //   }
      //   if (server) {
      //     const mod = server.moduleGraph.getModuleById(id);
      //     const missingDeps = ignoredModuleDependencies.get(mod);

      //     if (missingDeps) {
      //       console.log(missingDeps);
      //       console.log(mod);
      //     }
      //   }
      //   return null;
      // },
    },
  ];
}

function isRouteModule(initial: ModuleNode, prefix: string): boolean {
  const queue = [initial];
  const visited = new Set<ModuleNode>();

  while (queue.length > 0) {
    const mod = queue.shift()!;

    if (visited.has(mod)) {
      continue;
    }

    console.log(mod);
    visited.add(mod);

    if (mod.file.startsWith(prefix)) {
      return true;
    }

    queue.push(...mod.importers);
  }

  return false;
}

function globHmrListener(): PluginOption {
  let server: ViteDevServer | undefined;

  return {
    name: "remastered:glob-listener",
    enforce: "post",
    configureServer(given) {
      server = given;
    },
    transform(code, id) {
      if (!code.includes("watch-glob:")) {
        return null;
      }

      const magicString = new MagicString(code);
      const ast = this.parse(code);
      const relativeGlobs: string[] = [];
      walk.simple(ast, {
        ImportDeclaration(node: any) {
          const matches = (node.source.value as string).match(
            /^watch-glob:(.+)$/
          );

          if (!matches) {
            return;
          }

          const [, relativePath] = matches;
          relativeGlobs.push(relativePath);
          magicString.remove(node.start, node.end);
        },
      });

      if (server) {
        const absoluteGlobs = relativeGlobs.map((relativeGlob) => {
          return path.resolve(path.dirname(id), relativeGlob);
        });

        const mod = server.moduleGraph.idToModuleMap.get(id);

        const oldGlobImporter = (server as any)._globImporters[mod.file];
        if (oldGlobImporter) {
          absoluteGlobs.unshift(oldGlobImporter.pattern);
        }

        (server as any)._globImporters[mod.file] = {
          module: mod,
          base: server.config.base,
          pattern: `+(${absoluteGlobs.join("|")})`,
        };
      }

      return {
        code: String(magicString),
        map: magicString.generateMap(),
      };
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
    patterns: string[];
    config: ResolvedConfig;
    baseDir: string;
  }): string[] {
    const patterns = opts.patterns.map((pattern) => {
      if (path.isAbsolute(pattern)) {
        return path.join(config.root, pattern.slice(1));
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
          const patterns = pattern.split(";");
          const files = matchGlob({
            patterns,
            baseDir,
            config,
          });
          const [file] = files;
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

function nodePolyfill(): PluginOption {
  let config: ResolvedConfig | undefined;

  return {
    enforce: "post",
    name: "remastered:node-polyfill",
    configResolved(given) {
      config = given;
    },
    transform(code, id) {
      if (!/\.(t|j)sx?$/.test(id)) {
        return;
      }

      if (!code.includes("__remastered_root__")) {
        return;
      }

      const magicString = new MagicString(code);
      const parsed = this.parse(code);

      walk.simple(parsed, {
        Identifier(node) {
          const name: string = (node as any).name;
          if (name === "__remastered_root__") {
            magicString.overwrite(
              node.start,
              node.end,
              JSON.stringify(config.root)
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
