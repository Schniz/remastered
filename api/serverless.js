import { renderRequest } from "../src/server";
import manifest from "./ssr-manifest.json";
import * as serverEntry from "../dist/server/entry-server";
import template from "../dist/server/template";
import { Request } from "node-fetch";

/**
 * @param {Request} req
 * @param {Response} res
 */
export default async (req, res) => {
  const { status, data, contentType } = await renderRequest(
    {
      template,
      manifest,
      serverEntry,
    },
    new Request(req.url, {
      headers: [["Accept", String(req.headers.get("accept"))]],
    })
  );
  res.status(status).setHeader("Content-Type", contentType).send(data);
};
