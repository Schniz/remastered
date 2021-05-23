import { Request, Response } from "node-fetch";
import path from "path";
import fs from "fs-extra";
import crypto from "crypto";

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
  return path.join(exportDir, "responses", sha1(request.url), "response.json");
}

function sha1(s: string): string {
  return crypto.createHash("sha1").update(s).digest("hex");
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

/**
 * This function should be defined in `config/vercel.ts`.
 * It allows static generation of content based on the pathnames
 * defined by this function. Each array entry is a pathname which
 * will be uploaded as a static response to Vercel.
 *
 * @example
 * ```ts
 * export const getStaticPaths: GetStaticPathsFn = async () => {
 *   return ["/about", "/some/markdown-content"];
 *   // Now the `/about` and `/some/markdown-content` will
 *   // not use SSR and wouldn't call `loader` on generation.
 *   // They will simply return the output of the values generated
 *   // at build time.
 * }
 * ```
 */
export type GetStaticPathsFn = () => string[] | Promise<string[]>;

export async function getStaticPathsFunction(
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
      if (typeof mod?.getStaticPaths === "function") {
        return mod.getStaticPaths;
      }
    }
  }
}
