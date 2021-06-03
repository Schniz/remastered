import express from "express";
import { createServer as createViteServer, ViteDevServer } from "vite";
import fs from "fs";
import path from "path";
import { Request as NFRequest } from "node-fetch";
import type { RenderFn } from "./entry-server";
import _ from "lodash";
import { getViteConfigPath } from "./getViteConfig";
import type { HttpRequest, HttpResponse } from "./HttpTypes";
import type { Server } from "http";

const isProd = process.env.NODE_ENV === "production";

function findDistRoot() {
  if (isProd) {
    const places = [path.join(__dirname, ".."), process.cwd()];

    const newPlace = places
      .map((place) => {
        return path.join(place, "dist");
      })
      .find((place) => {
        const filePath = path.join(place, "server/entry.server.js");
        return fs.existsSync(filePath);
      });

    if (!newPlace) {
      throw new Error("Can't find place!");
    }

    return newPlace;
  }
}

export async function createServer(
  root: string,
  port: number
): Promise<{ app: Express.Application; server: Server }> {
  process.env.REMASTERED_PROJECT_DIR = root;
  const app = express();
  let server = app.listen(port, "0.0.0.0");

  app.use(express.static(path.join(root, "public")));

  const vite = isProd
    ? undefined
    : await createViteServer({
        root,
        configFile: getViteConfigPath({ ssr: false }),
        server: {
          middlewareMode: "ssr",
          hmr: { server, port, path: "/@vite/_hmr_" },
        },
      });

  const distRoot = findDistRoot();

  if (vite) {
    app.use(vite.middlewares);
  } else {
    app.use("/assets", express.static(path.join(distRoot!, "client/assets")));
  }

  app.all("*", async (req, res) => {
    const method = req.method.toUpperCase();
    const request = new NFRequest(req.url, {
      method,
      body: method !== "GET" && method !== "HEAD" ? req : undefined,
      headers: _(req.headers)
        .entries()
        .map(([key, value]) => value !== undefined && [key, String(value)])
        .compact()
        .value(),
    });
    const response = await renderRequest(
      await getViteHandlers(vite),
      request as unknown as Request,
      vite
    );
    const headers = _([...response.headers.entries()])
      .fromPairs()
      .value();
    res.writeHead(response.status, headers).end(response.body);
  });

  return { app, server };
}

export async function renderRequest(
  handlers: ViteHandlers,
  request: HttpRequest,
  vite?: ViteDevServer
): Promise<HttpResponse> {
  try {
    const render: RenderFn = handlers.serverEntry.render;
    return await render({
      request,
      manifest: handlers.manifest,
      viteDevServer: vite,
      clientManifest: handlers.clientManifest,
    });
  } catch (e) {
    // If an error is caught, let vite fix the stracktrace so it maps back to
    // your actual source code.
    vite?.ssrFixStacktrace(e);
    console.error(e);
    const message = request.headers.has("x-debug") ? String(e) : e.message;
    return new Response(message, {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}

export async function main(root: string) {
  const port = Number(process.env.PORT || 3000);
  console.log(`🌬  Warming up...`);
  await createServer(root, port);
  console.log(
    `🎷 Pum, pum, pum! Server is playing at http://localhost:${port}`
  );
}

if (require.main === module) {
  main(path.dirname(__dirname));
}

type ViteHandlers = {
  serverEntry: any;
  manifest?: Record<string, string[]>;
  clientManifest?: import("vite").Manifest;
};

async function getViteHandlers(
  vite: ViteDevServer | undefined
): Promise<ViteHandlers> {
  if (!vite) {
    const distRoot = findDistRoot();
    return {
      serverEntry: require(`${distRoot}/server/entry.server.js`),
      manifest: require(`${distRoot}/client/ssr-manifest.json`),
      clientManifest: require(`${distRoot}/client/manifest.json`),
    };
  } else {
    const entry = require.resolve("./entry-server.js");
    return {
      serverEntry: await vite.ssrLoadModule(entry),
    };
  }
}
