import { Plugin } from "vite";
import createDebugger from "debug";

const PLUGIN_NAME = "remastered:ssr-process-env";
const debug = createDebugger(PLUGIN_NAME);

export function ssrProcessEnv(): Plugin {
  return {
    name: PLUGIN_NAME,
    enforce: "pre",
    transform(code, _id, ssr) {
      if (!ssr) {
        return null;
      }

      return {
        code: code.replace(/\bprocess\.env\b/g, () => {
          debug("Replaced process.env");
          return `globalThis["process"]["env"]`;
        }),
      };
    },
  };
}
