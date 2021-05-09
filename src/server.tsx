import fastify from "fastify";
import { createServer as createViteServer, ViteDevServer } from "vite";
import fastifyExpress from "fastify-express";
import fs from "fs";
import path from "path";
import fastifyStatic from "fastify-static";

function findDistRoot() {
  if (isProd) {
    try {
      require.resolve("../dist/server/entry-server.js");
      return path.join(__dirname, "../dist");
    } catch (e) {}

    try {
      require.resolve("../server/entry-server.js");
      return path.join(__dirname, "..");
    } catch (e) {}

    throw new Error(`Can't find stuff here!!!`);
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

    try {
      const { template, serverEntry, manifest } = await getViteHandlers(
        vite,
        req.url
      );
      const { render } = serverEntry;
      const { app, scripts } = await render(url, manifest);

      // 5. Inject the app-rendered HTML into the template.
      const html = template
        .replace(`<!--ssr-outlet-->`, app)
        .replace("<!--ssr-scripts-->", scripts);

      reply.status(200).header("Content-Type", "text/html").send(html);
    } catch (e) {
      // If an error is caught, let vite fix the stracktrace so it maps back to
      // your actual source code.
      vite?.ssrFixStacktrace(e);
      console.error(e);
      reply.status(500).send(e.message);
    }
  });

  return app;
}

async function main() {
  const app = await createServer();
  app.listen(3000);
}

if (require.main === module) {
  main();
}

async function getViteHandlers(
  vite: ViteDevServer | undefined,
  url: string
): Promise<{
  template: string;
  serverEntry: any;
  manifest?: Record<string, string[]>;
}> {
  if (!vite) {
    const distRoot = findDistRoot()!;
    return {
      serverEntry: require(path.join(distRoot, "server/entry-server.js")),
      manifest: require(path.join(distRoot, "client/ssr-manifest.json")),
      template: fs.readFileSync(
        path.join(distRoot, "client/index.html"),
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
