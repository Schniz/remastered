import { Module, parse, print } from "@swc/core";
import fs from "fs-extra";
import path from "path";
import { PluginOption, ResolvedConfig } from "vite";
import globby from "globby";
import { build } from "esbuild";

function isRoute(rootPath: string, filepath: string) {
  const routesPath = path.join(rootPath, "./app/routes/");
  if (filepath.startsWith(routesPath)) return true;
  return globby
    .sync(path.join(rootPath, "app", "layout.{t,j}s{x,}"))
    .includes(filepath);
}

/**
 * Removes all the `export const ...` from routes, so it won't use server side stuff in client side
 *
 * TODO this code uses SWC. Maybe we should use Babel?
 * We also use `print` by SWC which I do not want. I would want to only parse using SWC.
 * Unfortunately, the spans SWC produces do not reflect the actual code we send to it.
 * Meaning that if we use MagicString with it, it blows up: https://github.com/swc-project/swc/issues/1366
 */
export function routeTransformers(): PluginOption[] {
  const acceptSelfCode = `
    ;if (import.meta.hot) {
      import.meta.hot.accept(() => {
        // accepting self...
      });
    }
  `;
  let resolvedConfig: ResolvedConfig | undefined;

  return [
    {
      enforce: "pre",
      name: "remastered:route",
      configResolved(given) {
        resolvedConfig = given;
      },
      load(id) {
        if (!resolvedConfig) {
          this.error(`Config is not resolved`);
        }

        if (!isRoute(resolvedConfig.root, id)) {
          return null;
        }
        if (!/\.(t|j)sx?$/.test(id)) {
          return null;
        }

        const contents = fs.readFileSync(id, "utf8");
        return contents + acceptSelfCode;
      },
      async transform(code, id, ssr) {
        if (!resolvedConfig) {
          this.error(`Config is not resolved`);
        }
        if (ssr) return null;
        if (!isRoute(resolvedConfig.root, id)) {
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

        const allowedExports = ["handle", "meta", "ErrorBoundary", "default"];

        for (const item of parsed.body) {
          if (item.type !== "ExportDeclaration") {
            body.push(item);
          } else if (item.declaration.type === "FunctionDeclaration") {
            if (allowedExports.includes(item.declaration.identifier.value)) {
              body.push(item);
            }
          } else if (item.declaration.type === "VariableDeclaration") {
            const declarations = item.declaration.declarations.filter(
              (declaration) => {
                return (
                  declaration.id.type === "Identifier" &&
                  allowedExports.includes(declaration.id.value)
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

        const treeshaken = await forceServerTreeShakingWithEsbuild({
          filepath: id,
          contents: result.code,
        });

        if (typeof treeshaken === "string") {
          return {
            code: treeshaken,
          };
        }

        return result;
      },
      async handleHotUpdate(ctx) {
        ctx.server.ws.send({
          type: "custom",
          event: "remastered:server-module-updated",
          data: {},
        });
      },
    },
  ];
}

async function forceServerTreeShakingWithEsbuild(opts: {
  filepath: string;
  contents: string;
}): Promise<string | undefined> {
  const esbuildOutput = await build({
    stdin: {
      sourcefile: opts.filepath,
      contents: opts.contents,
      loader: opts.filepath.endsWith("tsx") ? "tsx" : "jsx",
    },
    format: "esm",
    bundle: true,
    jsx: "transform",
    write: false,
    plugins: [
      {
        name: "all-external",
        setup(p) {
          p.onResolve({ filter: /.*/ }, (args) => {
            return { external: true, path: args.path };
          });
        },
      },
    ],
  });

  const outputfile = esbuildOutput.outputFiles?.[0];
  if (outputfile) {
    return outputfile.text;
  }
}
