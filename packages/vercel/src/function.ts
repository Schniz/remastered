import { renderRequest } from "remastered/dist/server";
import { Request } from "node-fetch";
import type { VercelApiHandler } from "@vercel/node";
import _ from "lodash";
import { getRenderContext } from "./getRenderContext";
import { deserializeResponse, getResponsePath } from "./StaticExporting";
import fs from "fs-extra";

export function createVercelFunction({
  rootDir,
  serverEntry,
}: {
  rootDir: string;
  serverEntry: unknown;
}): VercelApiHandler {
  process.env.REMASTER_PROJECT_DIR = rootDir;
  const renderContext$ = getRenderContext({ rootDir, serverEntry });

  return async (req, res) => {
    const method = req.method?.toUpperCase() ?? "GET";
    const request = new Request(req.url ?? "/", {
      method,
      // @ts-ignore
      body: method !== "GET" && method !== "HEAD" ? req : undefined,
      // @ts-ignore
      headers: { ...req.headers },
    });

    let response: Response;
    const responsePath = getResponsePath(rootDir, request);

    if (
      !request.headers.has("x-skip-exported") &&
      (await fs.pathExists(responsePath))
    ) {
      response = deserializeResponse(await fs.readJson(responsePath)) as any;
    } else {
      response = await renderRequest(
        await renderContext$,
        // @ts-ignore
        request
      );
    }

    res.status(response.status);
    for (const [header, value] of response.headers) {
      res.setHeader(header, value);
    }
    res.end(response.body);
  };
}
