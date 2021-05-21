import { PluginOption, ResolvedConfig } from "vite";
import fs from "fs-extra";
import path from "path";

export function debugPlugin(): PluginOption {
  let resolvedConfig: ResolvedConfig;
  const output: Record<string, string> = {};

  return {
    name: "remastered:debug",
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

      const outDir = resolvedConfig.build.outDir;
      await fs.outputJson(path.join(outDir, "debug-manifest.json"), output, {
        spaces: 2,
      });
    },
  };
}
