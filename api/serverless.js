import { renderRequest } from "../src/server";
import manifest from "./ssr-manifest.json";
import * as serverEntry from "../dist/server/entry-server";
import template from "../dist/server/template";
import { Request } from "node-fetch";
import _ from "lodash";

/**
 * @param {Request} req
 * @param {import('@vercel/node').VercelResponse} res
 */
export default async (req, res) => {
  const method = req.method.toUpperCase();
  const response = await renderRequest(
    {
      template,
      manifest,
      serverEntry,
    },
    new Request(req.url, {
      method,
      body: method !== "GET" && method !== "HEAD" ? req : undefined,
      headers: { ...req.headers },
    })
  );

  res.status(response.status);
  for (const [header, value] of response.headers) {
    res.setHeader(header, value);
  }
  res.end(response.body);
};
