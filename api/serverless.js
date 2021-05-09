import { renderRequest } from "../src/server";
import manifest from "./ssr-manifest.json";
import * as serverEntry from "../dist/server/entry-server";
import template from "../dist/server/template";

/**
 * @param {Request} req
 */
export default async (req, res) => {
  const { status, data } = await renderRequest(
    {
      template,
      manifest,
      serverEntry,
    },
    new Request(req.url, {
      headers: [["Accept", String(req.headers.get("accept"))]],
    })
  );
  res.status(status).send(data);
};
