import { PluginOption, ResolvedConfig } from "vite";
import fs from "fs-extra";
import path from "path";

export function debugPlugin(): PluginOption {
  let resolvedConfig: ResolvedConfig;
  const output: Record<string, string> = {};

  return {
    name: "remastered:debug",
    enforce: "post",
    apply: "build",
    configResolved(given) {
      resolvedConfig = given;
    },
    moduleParsed(moduleInfo) {
      if (moduleInfo.code) {
        output[moduleInfo.id] = moduleInfo.code;
      }
    },
    async buildEnd() {
      if (!resolvedConfig) {
        this.error(`Config file was not resolved!`);
      }

      const isSsr = Boolean(resolvedConfig.build.ssr);

      await fs.outputJson(
        path.join(
          process.cwd(),
          "debug",
          isSsr ? "ssr" : "client",
          "debug-manifest.json"
        ),
        output,
        {
          spaces: 2,
        }
      );
    },
  };
}
