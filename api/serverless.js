import { renderRequest } from "../src/server";
import manifest from "../client/ssr-manifest.json";
import serverEntry from "../server/entry-server";
import template from "../server/template";

export default async (req, res) => {
  const { status, data } = await renderRequest(
    {
      template,
      manifest,
      serverEntry,
    },
    req.url
  );
  res.status(status).send(data);
};
