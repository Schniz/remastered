import { Request, Response } from "node-fetch";
import path from "path";
import fs from "fs-extra";

type SerializedResponse = {
  body: number[];
  headers: [string, string][];
  url?: string;
  status: number;
};

export async function serializeResponse(
  response: Response
): Promise<SerializedResponse> {
  const body = await response.arrayBuffer();
  return {
    headers: [...response.headers],
    body: [...new Uint8Array(body)],
    url: response.url,
    status: response.status,
  };
}

export function deserializeResponse(serialized: SerializedResponse): Response {
  const body = Buffer.from(new Uint8Array(serialized.body));
  return new Response(body, {
    headers: serialized.headers,
    url: serialized.url,
    status: serialized.status,
  });
}

/**
 * @param exportDir `${process.cwd()}/dist/exported`
 */
export function getResponsePath(
  exportDir: string,
  request: Pick<Request, "url">
): string {
  return path.join(exportDir, "responses", request.url, "response.json");
}

export async function store(
  exportDir: string,
  request: Request,
  response: Response
) {
  const serialized = await serializeResponse(response);

  if (response.status === 200 && path.extname(request.url)) {
    const filename = path.join(exportDir, "public", request.url);
    await fs.outputFile(
      filename,
      await deserializeResponse(serialized).buffer()
    );
    console.error(`Static file exported to ${filename}`);
  }

  const responsePath = getResponsePath(exportDir, request);
  await fs.outputJson(responsePath, serialized);
  console.error(`Response output exported to ${responsePath}`);
}

export async function getStaticRoutesFunction(
  serverEntry: any
): Promise<(() => Promise<string[]>) | undefined> {
  const configs = serverEntry?.configs ?? {};
  const configPlaces = [
    "/config/vercel.tsx",
    "/config/vercel.ts",
    "/config/vercel.jsx",
    "/config/vercel.js",
  ];

  for (const key of configPlaces) {
    if (configs[key]) {
      const mod = await configs[key]();
      if (typeof mod?.getStaticRoutes === "function") {
        return mod.getStaticRoutes;
      }
    }
  }
}
