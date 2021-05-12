import ReactDOMServer from "react-dom/server";
import React from "react";
import App from "./App";
import { routeElementsObject as routes, routesObject } from "./fsRoutes";
import { matchRoutes, matchPath, RouteMatch } from "react-router";
import { StaticRouter } from "react-router-dom/server";
import { CustomRouteObject } from "./routeTreeIntoReactRouterRoute";
import _ from "lodash";
import { DynamicImportComponentContext } from "./DynamicImportComponent";
import { buildRouteDefinitionBag } from "./buildRouteComponentBag";
import { LoaderContext } from "./LoaderContext";
import fetch, { Response, Request } from "node-fetch";
import { NotFoundAndSkipRenderOnServerContext } from "./NotFoundAndSkipRenderOnServerContext";
import { mapValues, mapKeys } from "./Map";
import type { ViteDevServer } from "vite";

global.fetch = fetch as any;

type RequestContext = {
  request: Request;
  manifest?: Record<string, string[]>;
  renderTemplate(opts: { preloadHtml: string; appHtml: string }): string;
  viteDevServer?: ViteDevServer;
};

async function onGet({
  request,
  manifest,
  viteDevServer,
  renderTemplate,
}: RequestContext): Promise<Response> {
  const url = request.url.replace(/\.json$/, "");
  const isJsonResponse =
    request.url.endsWith(".json") ||
    request.headers.get("accept")?.includes("application/json");

  let found = matchRoutes(routes, url) ?? [];
  if (isJsonResponse) {
    found = found.filter((x) => matchPath(x.pathname, url));
  }

  const foundRouteKeys = getRouteKeys(found);
  const relevantRoutes = await buildRouteDefinitionBag(foundRouteKeys);
  const loadedComponents = mapValues(relevantRoutes, (x) => x.component);
  const loaderContext = new Map<string, unknown>();
  let loaderNotFound = false;

  for (const relevantRoute of relevantRoutes.values()) {
    if (relevantRoute.loader) {
      const params = relevantRoute.givenRoute.params;
      const key = `${relevantRoute.key}`;
      const loaderResult = await relevantRoute.loader({
        params,
      });
      loaderContext.set(key, loaderResult);

      if (loaderResult === null || loaderResult === undefined) {
        loaderNotFound = true;
      }
    }
  }

  let status = 200;

  if (loaderNotFound) {
    loaderContext.clear();
    status = 404;
  }

  if (isJsonResponse) {
    return new Response(JSON.stringify({ data: [...loaderContext] }), {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const routeKeys = foundRouteKeys.map((x) => x.routeKey);
  const scripts =
    buildScripts(routeKeys, manifest, viteDevServer) +
    (await buildWindowValues(found, loaderContext, status));

  const string = ReactDOMServer.renderToString(
    <NotFoundAndSkipRenderOnServerContext.Provider
      value={{
        state: new Map([["default", loaderNotFound ? "not_found" : "ok"]]),
      }}
    >
      <LoaderContext.Provider
        value={mapKeys(loaderContext, (a) => `default@${a}`)}
      >
        <DynamicImportComponentContext.Provider value={loadedComponents}>
          <StaticRouter location={url}>
            <App />
          </StaticRouter>
        </DynamicImportComponentContext.Provider>
      </LoaderContext.Provider>
    </NotFoundAndSkipRenderOnServerContext.Provider>
  );

  const html = renderTemplate({ preloadHtml: scripts, appHtml: string });
  return new Response(html, {
    status,
    headers: {
      "Content-Type": "text/html",
    },
  });
}

export async function render(ctx: RequestContext): Promise<Response> {
  if (ctx.request.method === "GET") {
    return await onGet(ctx);
  }
  const result = await onAction(ctx);
  if (!result) {
    return new Response("Not found", { status: 404 });
  }
  return result;
}

export type RenderFn = typeof render;

async function onAction({
  request,
}: RequestContext): Promise<Response | undefined> {
  const url = request.url.replace(/\.json$/, "");
  const found = matchRoutes(routes, url) ?? [];
  const foundRouteKey = getRouteKeys(found).slice(-1)[0];
  if (!foundRouteKey) {
    return;
  }
  const relevantRouteBag = await buildRouteDefinitionBag([foundRouteKey]);
  const route = [...relevantRouteBag.values()][0];

  if (!route.action) {
    return;
  }

  return await route.action({ req: request });
}

function getRouteKeys(routes: RouteMatch[]): EnhancedRoute[] {
  return _(routes)
    .map<EnhancedRoute | undefined>((a) => {
      const routeKey = (a.route as CustomRouteObject).routeFile;
      if (routeKey) {
        return { ...a, routeKey };
      }
    })
    .compact()
    .value();
}

type EnhancedRoute = RouteMatch & {
  routeKey: string;
};

function buildScripts(
  routeKeys: string[],
  manifest?: Record<string, string[]>,
  vite?: ViteDevServer
): string {
  if (manifest) {
    const preload = _(manifest)
      .entries()
      .filter(([key]) => {
        return routeKeys.some((routeKey) => {
          return key.endsWith(`/app/routes/${routeKey}`);
        });
      })
      .map(([, v]) => v)
      .flatten()
      .map((url) => {
        const rel = url.endsWith(".css") ? "stylesheet" : "modulepreload";
        return <link rel={rel} href={url} key={url} />;
      })
      .value();

    return ReactDOMServer.renderToStaticMarkup(<>{preload}</>);
  }

  const preloadLinks = getPreloadFromVite(vite, routeKeys);

  const elms = _([...preloadLinks])
    .map(([url]) => {
      return <link rel="modulepreload" href={url} key={url} />;
      /* return <script type="module" src={url} />; */
    })
    .value();
  return ReactDOMServer.renderToStaticMarkup(<>{elms}</>);
}

async function buildWindowValues(
  routes: RouteMatch[],
  loaderContext: Map<string, unknown>,
  splashState: number
): Promise<string> {
  const allRoutes = await buildRouteDefinitionBag(
    Object.keys(routesObject).map((x) => ({
      routeKey: x.replace("/app/routes/", ""),
    }))
  );
  const routeFiles = _(routes)
    .map((route) => {
      return (route.route as CustomRouteObject).routeFile;
    })
    .compact()
    .value();
  const data = {
    __REMASTERED_SPLASH_STATE: splashState,
    __REMASTERED_SSR_ROUTES: routeFiles,
    __REMASTERED_LOAD_CTX: [...loaderContext.entries()],
    __REMASTERED_ROUTE_DEFS: [
      ...mapValues(allRoutes, (x) => ({
        hasLoader: Boolean(x.loader),
      })),
    ],
  };
  const stringified = _(data)
    .map((value, key) => {
      return `window.${key}=JSON.parse(${JSON.stringify(
        JSON.stringify(value)
      )});`;
    })
    .join("");
  return `<script>${stringified}</script>`;
}

function getPreloadFromVite(
  vite: ViteDevServer | undefined,
  routeKeys: string[]
): Map<string, "js" | "css"> {
  const resolvedModules = new Map<string, "js" | "css">();

  if (!vite) {
    return resolvedModules;
  }

  /* const result: Record<string, string[]> = {}; */
  const moduleQueue = _(routeKeys)
    .map((x) => `${process.cwd()}/app/routes/${x}`)
    .concat([`${process.cwd()}/src/main.tsx`])
    .map((x) => {
      return vite.moduleGraph.fileToModulesMap.get(x);
    })
    .compact()
    .flatMap((x) => [...x])
    .compact()
    .value();
  /* console.log(vite.moduleGraph.fileToModulesMap); */

  while (moduleQueue.length) {
    const moduleNode = moduleQueue.shift()!;
    resolvedModules.set(moduleNode.url, moduleNode.type);
    moduleQueue.push(...moduleNode.importedModules);
  }

  return resolvedModules;
}
