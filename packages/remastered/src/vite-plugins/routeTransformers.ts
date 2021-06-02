import fs from "fs-extra";
import path from "path";
import { PluginOption, ResolvedConfig } from "vite";
import globby from "globby";
import { parse as parseWithBabel } from "@babel/core";
import type { ParserPlugin } from "@babel/parser";
import traverse from "@babel/traverse";
import MagicString, { SourceMap } from "magic-string";

function isRoute(rootPath: string, filepath: string) {
  const routesPath = path.join(rootPath, "./app/routes/");
  if (filepath.startsWith(routesPath)) return true;
  return globby
    .sync(path.join(rootPath, "app", "layout.{t,j}s{x,}"))
    .includes(filepath);
}

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
  let resolvedConfig: ResolvedConfig | undefined;

  return [
    {
      enforce: "pre",
      name: "remaster:route",
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

        return transform(code, id);
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

export function transform(
  code: string,
  filename: string
): null | { code: string; map: SourceMap } {
  const parserPlugins: ParserPlugin[] = [
    "importMeta",
    // since the plugin now applies before esbuild transforms the code,
    // we need to enable some stage 3 syntax since they are supported in
    // TS and some environments already.
    "topLevelAwait",
    "classProperties",
    "classPrivateProperties",
    "classPrivateMethods",
  ];

  if (filename.endsWith("x")) {
    parserPlugins.push("jsx");
  }

  if (/\.tsx?$/.test(filename)) {
    parserPlugins.push("typescript");
  }

  const magicString = new MagicString(code);

  const program = parseWithBabel(code, {
    filename,
    sourceType: "module",
    parserOpts: {
      plugins: parserPlugins,
    },
  });

  if (!program) {
    return null;
  }

  const allowedExports = ["handle", "meta"];

  traverse(program, {
    ExportNamedDeclaration(node) {
      const declaration = node.get("declaration").node;
      if (declaration?.type === "FunctionDeclaration") {
        if (!allowedExports.includes(declaration.id?.name!)) {
          magicString.remove(node.node.start!, node.node.end!);
        }
      } else if (declaration?.type === "VariableDeclaration") {
        let shouldRemoveEntireNode = true;
        for (const decl of declaration.declarations) {
          if (allowedExports.includes((decl.id as any).name)) {
            shouldRemoveEntireNode = false;
          } else if (decl.start && decl.end) {
            magicString.remove(decl.start, decl.end);
          }
        }
        if (shouldRemoveEntireNode) {
          magicString.remove(node.node.start!, node.node.end!);
        }
      }
    },
  });

  return { code: magicString.toString(), map: magicString.generateMap() };
}
