// @ts-check

import { renderRequest } from "@remastered/core/dist/src/server";
import * as serverEntry from "../dist/server/entry.server";
import { Request } from "node-fetch";
import _ from "lodash";
import fs from "fs-extra";
import path from "path";

/**
 * @param {Request} req
 * @param {import('@vercel/node').VercelResponse} res
 */
export default async (req, res) => {
  console.log({ cwd: process.cwd(), dirname: __dirname, ...process.env });
  const manifest = fs.readJsonSync(
    path.join(process.cwd(), "../dist/client/ssr-manifest.json")
  );
  const clientManifest = fs.readJsonSync(
    path.join(process.cwd(), "../dist/client/manifest.json")
  );

  const method = req.method.toUpperCase();
  const request = new Request(req.url, {
    method,
    // @ts-ignore
    body: method !== "GET" && method !== "HEAD" ? req : undefined,
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
