import { Module, parse, print } from "@swc/core";
import fs from "fs-extra";
import path from "path";
import { PluginOption, ResolvedConfig } from "vite";

/**
 * Removes all the `export const ...` from routes, so it won't use server side stuff in client side
 */
export function routeTransformers(): PluginOption[] {
  const acceptSelfCode = `
    ;if (import.meta.hot) {
      import.meta.hot.accept(() => {
        // accepting self...
      });
    }
  `;
  // let server: ViteDevServer | undefined;
  let resolvedConfig: ResolvedConfig | undefined;

  function modulePrefix(config: ResolvedConfig) {
    return path.join(config.root, "./app/routes/");
  }

  return [
    {
      enforce: "pre",
      name: "remaster:route",
      configResolved(given) {
        resolvedConfig = given;
      },
      // configureServer(given) {
      //   server = given;
      // },
      load(id) {
        if (!resolvedConfig) {
          this.error(`Config is not resolved`);
        }

        if (!id.startsWith(modulePrefix(resolvedConfig))) {
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
        if (!id.startsWith(modulePrefix(resolvedConfig))) {
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
        ctx.server.ws.send({
          type: "custom",
          event: "remastered:server-module-updated",
          data: {},
        });
      },
    },
  ];
}
