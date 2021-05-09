import fastify from "fastify";
import { createServer as createViteServer, ViteDevServer } from "vite";
import fastifyExpress from "fastify-express";
import fs from "fs";
import path from "path";
import fastifyStatic from "fastify-static";

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
  const app = fastify();
  await app.register(fastifyExpress);

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
    const url = req.url;

    const { data, status } = await renderRequest(
      await getViteHandlers(vite, url),
      url,
      vite
    );
    reply.status(status).send(data);
  });

  return app;
}

export async function renderRequest(
  handlers: ViteHandlers,
  url: string,
  vite?: ViteDevServer
): Promise<{ data: string; status: number }> {
  try {
    const { render } = handlers.serverEntry;
    const { app, scripts } = await render(url, handlers.manifest);

    // 5. Inject the app-rendered HTML into the template.
    const html = handlers.template
      .replace(`<!--ssr-outlet-->`, app)
      .replace("<!--ssr-scripts-->", scripts);
    return { status: 200, data: html };
  } catch (e) {
    // If an error is caught, let vite fix the stracktrace so it maps back to
    // your actual source code.
    vite?.ssrFixStacktrace(e);
    console.error(e);
    return { status: 500, data: e.message };
  }
}

async function main() {
  const app = await createServer();
  app.listen(3000);
}

if (require.main === module) {
  main();
}

type ViteHandlers = {
  template: string;
  serverEntry: any;
  manifest?: Record<string, string[]>;
};

async function getViteHandlers(
  vite: ViteDevServer | undefined,
  url: string
): Promise<ViteHandlers> {
  if (!vite) {
    return {
      serverEntry: require("../dist/server/entry-server.js"),
      manifest: require("../dist/client/ssr-manifest.json"),
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

const isProd = process.env.NODE_ENV === "production";
