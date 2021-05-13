import fastify from "fastify";
import { createServer as createViteServer, ViteDevServer } from "vite";
import fastifyExpress from "fastify-express";
import fs from "fs";
import path from "path";
import fastifyStatic from "fastify-static";
import { Request, Response } from "node-fetch";
import type { RenderFn } from "./entry-server";
import _ from "lodash";

const isProd = process.env.NODE_ENV === "production";

function findDistRoot() {
  if (isProd) {
    const places = [path.join(__dirname, ".."), process.cwd()];

    const newPlace = places
      .map((place) => {
        return path.join(place, "dist");
      })
      .find((place) => {
        const filePath = path.join(place, "server/entry-server.js");
        return fs.existsSync(filePath);
      });

    if (!newPlace) {
      throw new Error("Can't find place!");
    }

    return newPlace;
  }
}

export async function createServer() {
  const app = fastify({ logger: isProd });
  await app.register(fastifyExpress);
  app.addContentTypeParser("*", (_request, _payload, done) => done(null));

  const vite = isProd
    ? undefined
    : await createViteServer({
        server: { middlewareMode: true },
      });

  const distRoot = findDistRoot();

  if (vite) {
    app.use(vite.middlewares);
  } else {
    await app.register(fastifyStatic, {
      root: path.join(distRoot!, "client/assets"),
      prefix: "/assets/",
    });
  }

  app.all("*", async (req, reply) => {
    const method = req.method.toUpperCase();
    const request = new Request(req.url, {
      method,
      body: method !== "GET" && method !== "HEAD" ? req.raw : undefined,
      headers: _(req.headers)
        .entries()
        .map(([key, value]) => value !== undefined && [key, String(value)])
        .compact()
        .value(),
    });
    const response = await renderRequest(
      await getViteHandlers(vite, request.url),
      request,
      vite
    );
    const headers = _([...response.headers.entries()])
      .fromPairs()
      .value();
    reply.status(response.status).headers(headers).send(response.body);
  });

  return app;
}

export async function renderRequest(
  handlers: ViteHandlers,
  request: Request,
  vite?: ViteDevServer
): Promise<Response> {
  try {
    const render: RenderFn = handlers.serverEntry.render;
    return await render({
      request,
      manifest: handlers.manifest,
      viteDevServer: vite,
      clientManifest: handlers.clientManifest,
      renderTemplate({ preloadHtml, appHtml }) {
        return handlers.template
          .replace(`<!--ssr-outlet-->`, appHtml)
          .replace("<!--ssr-scripts-->", preloadHtml);
      },
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

async function main() {
  const port = process.env.PORT || 3000;
  console.log(`Bootstrapping...`);
  const app = await createServer();
  console.log(`Server bootstrapped. Listening at ${port}`);

  app.listen(port, "0.0.0.0");
}

if (require.main === module) {
  main();
}

type ViteHandlers = {
  template: string;
  serverEntry: any;
  manifest?: Record<string, string[]>;
  clientManifest?: import("vite").Manifest;
};

async function getViteHandlers(
  vite: ViteDevServer | undefined,
  url: string
): Promise<ViteHandlers> {
  if (!vite) {
    return {
      serverEntry: require("../dist/server/entry-server.js"),
      manifest: require("../dist/client/ssr-manifest.json"),
      clientManifest: require("../dist/client/manifest.json"),
      template: fs.readFileSync(
        path.join(__dirname, "../dist/client/index.html"),
        "utf8"
      ),
    };
  } else {
    const rawTemplate = fs.readFileSync(
      path.join(__dirname, "../index.html"),
      "utf8"
    );
    const template = await vite.transformIndexHtml(url, rawTemplate);
    return {
      serverEntry: await vite.ssrLoadModule("/src/entry-server.tsx"),
      template,
    };
  }
}
