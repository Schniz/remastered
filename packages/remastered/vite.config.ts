import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import path from "path";
import fs from "fs-extra";
import { globFirst } from "./dist/vite-plugins/globFirst";
import { globHmrListener } from "./dist/vite-plugins/globHmrListener";
import { routeTransformers } from "./dist/vite-plugins/routeTransformers";
import { debugPlugin } from "./dist/vite-plugins/debugPlugin";

export function fileInCore(name: string): string {
  return path.join(process.cwd(), "node_modules/.remastered", name);
}

const symlinkDir = fileInCore("");
fs.removeSync(symlinkDir);
fs.outputFileSync(
  path.join(symlinkDir, "entry.client.js"),
  `import 'remastered/dist/main';`
);
fs.outputFileSync(
  path.join(symlinkDir, "entry.server.js"),
  `export * from 'remastered/dist/entry-server';`
);

// https://vitejs.dev/config/
const config = defineConfig({
  plugins: [
    globFirst(),
    routeTransformers(),
    globHmrListener(),
    reactRefresh(),
    debugPlugin(),
  ],
  define: {
    __DEV__: process.env.NODE_ENV !== "production",
    "process.env.REMASTER_PROJECT_DIR": JSON.stringify(
      process.env.REMASTER_PROJECT_DIR
    ),
  },
  build: {
    minify: false,
    rollupOptions: {
      input: fileInCore("entry.client.js"),
    },
  },
  optimizeDeps: {
    include: [
      "react-router",
      "react-router-dom",
      "react",
      "react-dom",
      "lodash",
      "@vitejs/plugin-react-refresh",
    ],
    entries: [
      path.join(__dirname, "./dist/main.js"),
      path.join(__dirname, "./dist/entry-server.js"),
    ],
    exclude: ["remastered", "glob-first:*"],
  },
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  ...({
    ssr: {
      noExternal: ["remastered"],
    },
  } as any),
});

export default config;
