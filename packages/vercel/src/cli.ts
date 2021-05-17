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
    const assetsDir = path.join(process.cwd(), "dist/client/assets");
    const publicAssetsDir = path.join(process.cwd(), "public/assets");
    console.error(
      `Copying contents of ${assetsDir} into ${publicAssetsDir}...`
    );
    await fs.copy(assetsDir, publicAssetsDir);
  },
});

const cli = subcommands({
  name: "remastered-vercel",
  cmds: { setup, postbuild },
});

run(binary(cli), process.argv);
