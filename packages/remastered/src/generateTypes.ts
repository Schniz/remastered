import globby from "globby";
import { formatRoutePath } from "./createRouteTreeFromImportGlob";
import fs from "fs-extra";
import path from "path";

function parseRoute(route: string): string[] {
  const paramRegex = /:[A-z_][A-z0-9_]*/g;
  const matches = route.match(paramRegex)?.map((x) => x.slice(1)) ?? [];
  return matches;
}

type GeneratedRoute = {
  filePath: string;
  route: string;
  params: string[];
};

export async function generateTypes(opts: { cwd: string }) {
  const files = await globby("**/*.{t,j}sx", {
    cwd: path.join(opts.cwd, "app", "routes"),
  });
  const routes = files.map((f): GeneratedRoute => {
    const reactRouterPath = f.split("/").map(formatRoutePath).join("");
    const parsed = parseRoute(reactRouterPath);
    return { filePath: f, route: reactRouterPath, params: parsed };
  });
  const dtsFile = `
export {};
declare global {
  namespace Remastered {
interface Routes {
  ${routes
    .map(({ route, params }) => {
      const paramType =
        params.length === 0
          ? "never"
          : params.map((x) => JSON.stringify(x)).join(" | ");
      return `
        ${JSON.stringify(route)}: ${paramType};
      `.trim();
    })
    .join("\n")}
}
  }
}
  `.trim();

  const outputs = [path.join(opts.cwd, "app", "_generated_types_.ts")];

  for (const output of outputs) {
    const currentFile = await fs.readFile(output, "utf8").catch(() => null);

    if (dtsFile !== currentFile) {
      await fs.outputFile(output, dtsFile);

      console.log(`🎷 Route types were generated to ${output}`);
    }
  }
}
