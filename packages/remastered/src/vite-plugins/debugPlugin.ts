import { PluginOption, ResolvedConfig } from "vite";
import fs from "fs-extra";
import path from "path";
import createDebugger from "debug";

const PLUGIN_NAME = `remastered:debug`;
const debug = createDebugger(PLUGIN_NAME);

export function debugPlugin(): PluginOption {
  let resolvedConfig: ResolvedConfig;
  const isEnabled = Boolean(process.env.REMASTERED_DEBUG_MANIFEST);
  const output: Record<string, string> = {};
  const chunkData: Record<string, unknown> = {};

  return {
    name: PLUGIN_NAME,
    enforce: "post",
    apply: "build",
    ...(isEnabled && {
      configResolved(given) {
        resolvedConfig = given;

        if (debug.enabled) {
          for (const plugin of given.plugins) {
            debug(`Loaded plugin ${plugin.name}`, plugin.options);
          }
        }
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
