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
    async writeBundle() {
      if (!resolvedConfig) {
        this.error(`Config file was not resolved!`);
      }

      console.error("WELP");
      const buildDir = resolvedConfig.build.outDir;

      await fs.outputJson(path.join(buildDir, "debug-manifest.json"), output, {
        spaces: 2,
      });
    },
  };
}
