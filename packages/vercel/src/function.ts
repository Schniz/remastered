import { renderRequest } from "remastered/dist/server";
import { Request } from "node-fetch";
import type { VercelApiHandler } from "@vercel/node";
import fs from "fs-extra";
import path from "path";
import _ from "lodash";

export function createVercelFunction({
  rootDir,
}: {
  rootDir: string;
}): VercelApiHandler {
  const manifest$ = fs.readJson(
    path.join(rootDir, "dist/client/ssr-manifest.json")
  );
  const clientManifest$ = fs.readJson(
    path.join(rootDir, "dist/client/manifest.json")
  );
  const serverEntry$ = import(
    path.join(rootDir, "dist/server/entry.server.js")
  );

  return async (req, res) => {
    const [manifest, clientManifest, serverEntry] = await Promise.all([
      manifest$,
      clientManifest$,
      serverEntry$,
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
