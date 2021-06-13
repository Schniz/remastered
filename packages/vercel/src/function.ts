import { Request } from "node-fetch";
import type { VercelApiHandler } from "@vercel/node";
import _ from "lodash";
import { getRenderContext } from "./getRenderContext";
import { deserializeResponse, getResponsePath } from "./StaticExporting";
import fs from "fs-extra";
import path from "path";
import type { render } from "remastered/dist/entry-server";
import type { HttpRequest, HttpResponse } from "remastered/dist/HttpTypes";

type RenderFn = typeof render;

export function createVercelFunction({
  rootDir,
  serverEntry: getServerEntry,
}: {
  rootDir: string;
  serverEntry(): Promise<{ render: RenderFn }>;
}): VercelApiHandler {
  process.env.REMASTERED_PROJECT_DIR = rootDir;
  const renderContext$ = getRenderContext({ rootDir });
  const serverEntry$ = getServerEntry();

  return async (req, res) => {
    const method = req.method?.toUpperCase() ?? "GET";
    const request = new Request(req.url ?? "/", {
      method,
      body: method !== "GET" && method !== "HEAD" ? req : undefined,
      // @ts-expect-error
      headers: { ...req.headers },
    });

    const response =
      (await findExportedResponse(rootDir, request)) ??
      (await (
        await serverEntry$
      ).render({
        request,
        ...(await renderContext$),
      }));

    res.status(response.status);
    for (const [header, value] of response.headers) {
      res.setHeader(header, value);
    }
    res.end(response.body);
  };
}

async function findExportedResponse(
  rootDir: string,
  request: HttpRequest
): Promise<HttpResponse | null> {
  if (request.headers.has("x-skip-exported")) {
    return null;
  }

  const responsePath = getResponsePath(
    path.join(rootDir, "dist", "exported"),
    request
  );

  try {
    const response = deserializeResponse(await fs.readJson(responsePath));
    response.headers.set("x-remastered-static-exported", "true");
    return response;
  } catch (e) {
    console.error(`Can't read exported file from ${responsePath}`, e);
    return null;
  }
}
