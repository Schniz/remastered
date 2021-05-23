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

    const response =
      (await findExportedResponse(rootDir, request)) ??
      (await renderRequest(
        await renderContext$,
        // @ts-ignore
        request
      ));

    res.status(response.status);
    for (const [header, value] of response.headers) {
      res.setHeader(header, value);
    }
    res.end(response.body);
  };
}

async function findExportedResponse(
  rootDir: string,
  request: Request
): Promise<Response | null> {
  if (request.headers.has("x-skip-exported")) {
    return null;
  }

  const responsePath = getResponsePath(rootDir, request);

  try {
    const response = deserializeResponse(await fs.readJson(responsePath));
    response.headers.set("x-remastered-static-exported", "true");
    return response as any;
  } catch (e) {
    console.error(`Can't read exported file from ${responsePath}`, e);
    return null;
  }
}
