import { renderRequest } from "../src/server";
import manifest from "./ssr-manifest.json";
import * as serverEntry from "../dist/server/entry-server";
import template from "../dist/server/template";
import { Request } from "node-fetch";
import _ from "lodash";

/**
 * @param {Request} req
 * @param {Response} res
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
      body: method !== "GET" && method !== "HEAD" ? req.body : undefined,
      headers: { ...req.headers },
    })
  );

  res.writeHead(response.status, { ...response.headers });
  res.write(response.body);
  res.end();
};
