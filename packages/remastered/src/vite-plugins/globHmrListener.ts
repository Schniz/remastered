import MagicString from "magic-string";
import path from "path";
import { PluginOption, ViteDevServer } from "vite";
import * as walk from "acorn-walk";

export function globHmrListener(): PluginOption {
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

        if (mod && mod.file) {
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
      }

      return {
        code: String(magicString),
        map: magicString.generateMap(),
      };
    },
  };
}
