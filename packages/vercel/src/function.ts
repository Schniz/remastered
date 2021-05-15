import { renderRequest } from "@remastered/core/dist/src/server";
import { Request } from "node-fetch";
import type { VercelApiHandler } from "@vercel/node";
import fs from "fs-extra";
import path from "path";
import _ from "lodash";

export default function createVercelFunction({
  serverEntry,
  rootDir,
}: {
  serverEntry: typeof import("@remastered/core/dist/src/entry-server");
  rootDir: string;
}): VercelApiHandler {
  return async (req, res) => {
    console.log({ rootDir, files: fs.readdirSync(path.join(rootDir, "dist")) });
    const manifest$ = fs.readJson(
      path.join(rootDir, "dist/client/ssr-manifest.json")
    );
    const clientManifest$ = fs.readJson(
      path.join(rootDir, "dist/client/manifest.json")
    );
    const [manifest, clientManifest] = await Promise.all([
      manifest$,
      clientManifest$,
    ]);

    const method = req.method?.toUpperCase() ?? "GET";
    const request = new Request(req.url ?? "/", {
      method,
      // @ts-ignore
      body: method !== "GET" && method !== "HEAD" ? req : undefined,
      // @ts-ignore
      headers: { ...req.headers },
    });
    const response = await renderRequest(
      {
        manifest,
        serverEntry,
        clientManifest,
      },
      // @ts-ignore
      request
    );

    res.status(response.status);
    for (const [header, value] of response.headers) {
      res.setHeader(header, value);
    }
    res.end(response.body);
  };
}
