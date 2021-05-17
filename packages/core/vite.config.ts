import { defineConfig, PluginOption } from "vite";
import { Module, parse, print } from "@swc/core";
import reactRefresh from "@vitejs/plugin-react-refresh";
import path from "path";
import fs from "fs-extra";

export function fileInCore(name: string): string {
  return path.join(process.cwd(), "node_modules/.remastered", name);
}

const symlinkDir = fileInCore("");
fs.removeSync(symlinkDir);
fs.outputFileSync(
  path.join(symlinkDir, "entry.client.js"),
  `import '@remastered/core/dist/main';`
);
fs.outputFileSync(
  path.join(symlinkDir, "entry.server.js"),
  `export * from '@remastered/core/dist/entry-server';`
);

// https://vitejs.dev/config/
const config = defineConfig({
  plugins: [routeTransformer(), reactRefresh()],
  define: {
    __DEV__: process.env.NODE_ENV !== "production",
  },
  build: {
    rollupOptions: {
      input: fileInCore("entry.client.js"),
    },
  },
});

export default config;

/**
 * Removes all the `export const ...` from routes, so it won't use server side stuff in client side
 */
function routeTransformer(): PluginOption {
  const modulePrefix = path.join(process.cwd(), "./app/routes/");
  const acceptSelfCode = `
    ;if (import.meta.hot) {
      import.meta.hot.accept();
    }
  `;

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
                ["handle", "meta"].includes(declaration.id.value)
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

      const result = await print({ ...parsed, body });
      result.code = result.code + acceptSelfCode;
      return result;
    },
  };
}
