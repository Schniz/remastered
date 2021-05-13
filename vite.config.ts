import { defineConfig, PluginOption } from "vite";
import { parse, print } from "@swc/core";
import reactRefresh from "@vitejs/plugin-react-refresh";
import path from "path";

// https://vitejs.dev/config/
const config = defineConfig({
  plugins: [routeTransformer(), reactRefresh()],
  define: {
    __DEV__: process.env.NODE_ENV !== "production",
    __REMASTERED_ROOT__: JSON.stringify(process.cwd()),
  },
  build: {
    rollupOptions: {
      input: "./src/main.tsx",
    },
  },
  resolve: {
    alias: {
      "react-router": path.join(__dirname, "./react-router-pkgs/react-router"),
      "react-router-dom": path.join(
        __dirname,
        "./react-router-pkgs/react-router-dom"
      ),
    },
  },
  ...({
    ssr: {
      noExternal: [
        "react-router",
        "react-router-dom",
        "react-router-dom/server",
      ],
    },
  } as {}),
});

export default config;

/**
 * Removes all the `export const ...` from routes, so it won't use server side stuff in client side
 */
function routeTransformer(): PluginOption {
  const modulePrefix = path.join(__dirname, "./app/routes/");
  return {
    enforce: "pre",
    name: "remaster:route",
    async transform(code, id, ssr) {
      if (ssr) return null;
      if (!id.startsWith(modulePrefix)) {
        return null;
      }
      if (!/\.(t|j)sx?$/.test(id)) {
        return null;
      }

      const parsed = await parse(code, { syntax: "typescript", tsx: true });
      parsed.body = parsed.body.filter((x) => x.type !== "ExportDeclaration");

      return await print(parsed);
    },
  };
}
