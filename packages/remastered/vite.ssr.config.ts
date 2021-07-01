import config, { fileInCore } from "./vite.config";
import { merge } from "lodash";
import { defineConfig } from "vite";

export default merge(
  {},
  config,
  defineConfig({
    build: {
      rollupOptions: {
        input: fileInCore("entry.server.js"),
      },
    },
  })
);
