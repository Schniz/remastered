import { renderRequest } from "../src/server";
import manifest from "./ssr-manifest.json";
import serverEntry from "../dist/server/entry-server";
import template from "../dist/server/template";

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
