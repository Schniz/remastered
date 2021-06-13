import { Plugin } from "vite";
import createDebugger from "debug";
import MagicString from "magic-string";
import { simple } from "acorn-walk";
import path from "path";
import { ImportDeclaration } from "estree";

const PLUGIN_NAME = `remastered:env-specific-files`;
const debug = createDebugger(PLUGIN_NAME);

export function environmentSpecificFiles(): Plugin {
  const NOOP_FILENAME = `/@@/__remastered__noop__filename__`;

  return {
    name: PLUGIN_NAME,
    resolveId(source, importer, options, ssr) {
      const startsWithServer = source.startsWith("server-only:");
      const startsWithClient = source.startsWith("client-only:");

      if (startsWithServer || startsWithClient) {
        const newPath = source.slice(source.indexOf(":") + 1);
        return this.resolve(newPath, importer);
      }
    },
    async transform(code, _id, ssr) {
      if (!code.includes("server-only:") && !code.includes("client-only:")) {
        return null;
      }

      const magicString = new MagicString(code);
      const ast = this.parse(code);

      simple(ast, {
        ImportDeclaration(node) {
          const n = node as unknown as ImportDeclaration;
          if (typeof n.source.value !== "string") {
            return;
          }

          if (
            (ssr && n.source.value.startsWith("client-only:")) ||
            (!ssr && n.source.value.startsWith("server-only:"))
          ) {
            magicString.remove(node.start, node.end);
          }
        },
      });

      return {
        code: magicString.toString(),
        map: magicString.generateMap(),
      };
    },
    // async load(id, ssr) {
    //   if (id === NOOP_FILENAME) {
    //     return "// noop";
    //   }

    //   if (ssr) {
    //     if (/\.client\.[jt]sx?$/.test(id)) {
    //       debug(`Server found file ${id} which is client-only. Skipping!`);
    //       return "// noop";
    //     }

    //     return null;
    //   }

    //   if (/\.server\.[jt]sx?$/.test(id)) {
    //     debug(`Client found file ${id} which is server-only. Skipping!`);
    //     return "// noop";
    //   }

    //   return null;
    // },
  };
}
