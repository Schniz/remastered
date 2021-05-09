import { renderRequest } from "../src/server";
import manifest from "./ssr-manifest.json";
import serverEntry from "./entry-server";
import template from "./template";

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
