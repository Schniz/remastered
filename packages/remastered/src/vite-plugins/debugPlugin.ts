import { PluginOption, ResolvedConfig } from "vite";
import fs from "fs-extra";
import path from "path";

export function debugPlugin(): PluginOption {
  let resolvedConfig: ResolvedConfig;
  const isEnabled = Boolean(process.env.REMASTERED_DEBUG_MANIFEST);
  const output: Record<string, string> = {};
  const chunkData: Record<string, unknown> = {};

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
      augmentChunkHash(chunk) {
        chunkData[chunk.name] = chunk;
      },
      async writeBundle() {
        if (!resolvedConfig) {
          this.error(`Config file was not resolved!`);
        }

        const buildDir = resolvedConfig.build.outDir;

        await fs.outputJson(
          path.join(buildDir, "assets", "debug-manifest.json"),
          output,
          {
            spaces: 2,
          }
        );
        await fs.outputJson(
          path.join(buildDir, "assets", "debug-chunks.json"),
          chunkData,
          {
            spaces: 2,
          }
        );
      },
    }),
  };
}
