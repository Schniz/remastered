import { Module, parse, print } from "@swc/core";
import fs from "fs";
import path from "path";
import { PluginOption } from "vite";

/**
 * Removes all the `export const ...` from routes, so it won't use server side stuff in client side
 */
export function routeTransformers(): PluginOption[] {
  const modulePrefix = path.join(process.cwd(), "./app/routes/");
  const acceptSelfCode = `
    ;if (import.meta.hot) {
      import.meta.hot.accept(() => {
        // accepting self...
      });
    }
  `;
  // let server: ViteDevServer | undefined;

  return [
    {
      enforce: "pre",
      name: "remaster:route",
      // configureServer(given) {
      //   server = given;
      // },
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
  ];
}
