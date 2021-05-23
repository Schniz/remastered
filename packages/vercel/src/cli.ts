import { subcommands, command, binary, run } from "cmd-ts";
import _ from "lodash";
import fs from "fs-extra";
import path from "path";

function getVercelPath(baseDir: string): string {
  return path.join(baseDir, "vercel.json");
}

async function readJsonFile(filepath: string): Promise<unknown> {
  try {
    return await fs.readJSONSync(filepath);
  } catch (e) {
    if (e.code === "ENOENT") {
      return {};
    }
    throw e;
  }
}

const setup = command({
  name: "setup",
  description: `Set up a Vercel deploy target with a serverless function`,
  args: {},
  async handler() {
    const rootDir = process.cwd();
    const vercelPath = getVercelPath(rootDir);
    const packageJsonPath = path.join(rootDir, "package.json");
    const functionName = `api/remastered-serverless.js`;
    const newPackageJson = _.merge(await readJsonFile(packageJsonPath), {
      scripts: {
        "vercel-build": `remastered build && remastered-vercel postbuild`,
      },
    });
    let vercelConfig = _.mergeWith(
      await readJsonFile(vercelPath),
      {
        functions: {
          [`${functionName}`]: {
            includeFiles: "dist/*/*",
          },
        },
        rewrites: [
          {
            source: "/(.*)",
            destination: `/${functionName}`,
          },
        ],
      },
      (objValue: unknown, srcValue: unknown) => {
        if (Array.isArray(objValue) && Array.isArray(srcValue)) {
          return objValue.concat(srcValue);
        }
      }
    );

    await Promise.all([
      fs.copy(
        require.resolve("@remastered/vercel/serverless-function-template.js"),
        path.resolve(functionName)
      ),
      fs.outputJson(packageJsonPath, newPackageJson, { spaces: 2 }),
      fs.outputJson(vercelPath, vercelConfig, { spaces: 2 }),
    ]);
  },
});

const postbuild = command({
  name: "postbuild",
  description: "This should run after `remastered build` in `vercel-build`",
  args: {},
  async handler() {
    await exportCmd.handler({});

    const assetsDir = path.join(process.cwd(), "dist/client/assets");
    const publicExportedDir = path.join(process.cwd(), "dist/exported/public");
    const publicDir = path.join(process.cwd(), "public");
    const publicAssetsDir = path.join(publicDir, "assets");

    if (await fs.pathExists(publicExportedDir)) {
      console.error(
        `Copying contents of ${publicExportedDir} into ${publicDir}...`
      );
      await fs.copy(publicExportedDir, publicDir);
    }

    console.error(
      `Copying contents of ${assetsDir} into ${publicAssetsDir}...`
    );
    await fs.copy(assetsDir, publicAssetsDir);
  },
});

const exportCmd = command({
  name: "export",
  description: "export static routes",
  args: {},
  async handler() {
    const exportedDir = path.join(process.cwd(), "dist/exported");
    await fs.remove(exportedDir);
    const { getStaticRoutesFunction, store: storeTraffic } = await import(
      "./StaticExporting"
    );
    const { Request } = await import("node-fetch");
    const { renderRequest } = await import("remastered/dist/server");
    const serverEntry = await import(
      path.join(process.cwd(), "dist/server/entry.server.js")
    );
    const getStaticRoutes = await getStaticRoutesFunction(serverEntry);
    if (!getStaticRoutes) {
      return;
    }

    const { getRenderContext } = await import("./getRenderContext");
    const renderContext = await getRenderContext({
      rootDir: process.cwd(),
      serverEntry,
    });
    process.env.REMASTER_PROJECT_DIR = process.cwd();
    const routes: string[] = await getStaticRoutes();
    const requests = routes.flatMap((route) => {
      return [new Request(route), new Request(`${route}.json`)];
    });

    for (const request of requests) {
      const response = await renderRequest(renderContext, request as any);
      await storeTraffic(exportedDir, request, response as any);
    }
  },
});

const cli = subcommands({
  name: "remastered-vercel",
  cmds: { setup, postbuild, export: exportCmd },
});

run(binary(cli), process.argv);
