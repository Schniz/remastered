// @ts-check

import { renderRequest } from "@remastered/core/dist/src/server";
// @ts-ignore
import manifest from "./ssr-manifest.json";
// @ts-ignore
import clientManifest from "./manifest.json";
import * as serverEntry from "../dist/server/entry.server";
import { Request } from "node-fetch";
import _ from "lodash";

/**
 * @param {Request} req
 * @param {import('@vercel/node').VercelResponse} res
 */
export default async (req, res) => {
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
