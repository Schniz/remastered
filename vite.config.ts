import { defineConfig, PluginOption } from "vite";
import { Module, parse, print } from "@swc/core";
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
      input:
        process.env.REMASTERED_BUILD_TARGET === "server"
          ? "./src/entry-server.tsx"
          : "./src/main.tsx",
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

      const body: Module["body"] = [];

      const parsed = await parse(code, { syntax: "typescript", tsx: true });

      for (const item of parsed.body) {
        if (item.type !== "ExportDeclaration") {
          body.push(item);
        } else if (item.declaration.type === "VariableDeclaration") {
          const declarations = item.declaration.declarations.filter(
            (declaration) => {
              return (
                declaration.id.type === "Identifier" &&
                declaration.id.value === "handle"
              );
            }
          );
          if (declarations.length) {
            body.push({
              ...item,
              declaration: {
                ...item.declaration,
                declarations,
              },
            });
          }
        }
      }

      return await print({ ...parsed, body });
    },
  };
}
