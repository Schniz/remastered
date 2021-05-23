import fs from "fs-extra";
import path from "path";

export async function getRenderContext(opts: {
  rootDir: string;
  serverEntry: unknown;
}) {
  const [manifest, clientManifest] = await Promise.all([
    fs.readJson(path.join(opts.rootDir, "dist/client/ssr-manifest.json")),
    fs.readJson(path.join(opts.rootDir, "dist/client/manifest.json")),
  ]);

  return { manifest, clientManifest, serverEntry: opts.serverEntry };
}
