import { PluginOption, ResolvedConfig } from "vite";
import fs from "fs-extra";
import path from "path";

export function debugPlugin(): PluginOption {
  let resolvedConfig: ResolvedConfig;
  const isEnabled = Boolean(process.env.REMASTERED_DEBUG_MANIFEST);
  const output: Record<string, string> = {};

  return {
    name: "remastered:debug",
    enforce: "post",
    apply: "build",
    ...(isEnabled && {
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

        const buildDir = resolvedConfig.build.outDir;

        await fs.outputJson(
          path.join(buildDir, "debug-manifest.json"),
          output,
          {
            spaces: 2,
          }
        );
      },
    }),
  };
}
