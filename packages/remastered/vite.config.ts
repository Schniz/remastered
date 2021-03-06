import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import path from "path";
import fs from "fs-extra";
import { globFirst } from "./dist/vite-plugins/globFirst";
import { globHmrListener } from "./dist/vite-plugins/globHmrListener";
import { routeTransformers } from "./dist/vite-plugins/routeTransformers";
import { debugPlugin } from "./dist/vite-plugins/debugPlugin";
import { redirectRemasteredImports } from "./dist/vite-plugins/redirectRemasteredImports";
import { ssrProcessEnv } from "./dist/vite-plugins/ssrProcessEnv";
import { environmentSpecificFiles } from "./dist/vite-plugins/environmentSpecificFiles";
// import rpv from "rollup-plugin-visualizer";

export function fileInCore(name: string): string {
  return path.join(process.cwd(), "node_modules/.remastered", name);
}

const symlinkDir = fileInCore("");
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
    ssrProcessEnv(),
    globFirst(),
    routeTransformers(),
    globHmrListener(),
    reactRefresh(),
    debugPlugin(),
    redirectRemasteredImports(),
    environmentSpecificFiles(),
    // rpv({ open: true }),
  ],
  define: {
    __DEV__: process.env.NODE_ENV !== "production",
    "process.env.REMASTERED_PROJECT_DIR": JSON.stringify(
      process.env.REMASTERED_PROJECT_DIR
    ),
  },
  build: {
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
      "cookie",
      "cryptr",
      "@vitejs/plugin-react-refresh",
      "debug",
      "node-fetch",
      "history",
      "react-error-boundary",
      "cheerio",
      "react-dom/server",
      "superjson",
    ],
    entries: [
      path.join(__dirname, "./dist/main.js"),
      path.join(__dirname, "./dist/entry-server.js"),
      "app/routes/**/*.{t,j}s",
    ],
    exclude: ["remastered", "glob-first:*"],
  },
  resolve: {
    dedupe: ["react", "react-dom", "react-dom/server"],
    alias: {
      "~app": path.join(process.cwd(), "app"),
    },
  },
  ...({
    ssr: {
      noExternal: ["remastered"],
    },
  } as any),
});

export default config;
