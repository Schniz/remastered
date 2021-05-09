import fastify from "fastify";
import { createServer as createViteServer } from "vite";
import fastifyExpress from "fastify-express";
import fs from "fs";
import path from "path";

async function createServer() {
  const app = fastify();
  await app.register(fastifyExpress);

  const vite = await createViteServer({
    server: { middlewareMode: true },
  });

  app.use(vite.middlewares);

  app.all("*", async (req, reply) => {
    const url = req.url;

    try {
      // 1. Read index.html
      let template = fs.readFileSync(
        path.resolve(__dirname, "../index.html"),
        "utf-8"
      );

      // 2. Apply vite HTML transforms. This injects the vite HMR client, and
      //    also applies HTML transforms from Vite plugins, e.g. global preambles
      //    from @vitejs/plugin-react-refresh
      template = await vite.transformIndexHtml(url, template);

      // 3. Load the server entry. vite.ssrLoadModule automatically transforms
      //    your ESM source code to be usable in Node.js! There is no bundling
      //    required, and provides efficient invalidation similar to HMR.
      const { render } = await vite.ssrLoadModule("/src/entry-server.tsx");

      // 4. render the app HTML. This assumes entry-server.js's exported `render`
      //    function calls appropriate framework SSR APIs,
      //    e.g. ReactDOMServer.renderToString()
      const { app, scripts } = await render(url, vite);

      // 5. Inject the app-rendered HTML into the template.
      const html = template
        .replace(`<!--ssr-outlet-->`, app)
        .replace("<!--ssr-scripts-->", scripts);

      reply.status(200).header("Content-Type", "text/html").send(html);
    } catch (e) {
      // If an error is caught, let vite fix the stracktrace so it maps back to
      // your actual source code.
      vite.ssrFixStacktrace(e);
      console.error(e);
      reply.status(500).send(e.message);
    }
  });
  app.listen(3000);
}

createServer();
