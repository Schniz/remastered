import ReactDOMServer from "react-dom/server";
import React from "react";
import App from "./App";
import { routeElementsObject as routes, routesObject } from "./fsRoutes";
import { matchRoutes, RouteMatch } from "react-router";
import { StaticRouter } from "react-router-dom/server";
import { CustomRouteObject } from "./routeTreeIntoReactRouterRoute";
import _ from "lodash";
import { DynamicImportComponentContext } from "./DynamicImportComponent";
import { buildRouteDefinitionBag, mapValues } from "./buildRouteComponentBag";
import { LoaderContext } from "./LoaderContext";
import fetch, { Response, Request } from "node-fetch";
import { NotFoundAndSkipRenderOnServerContext } from "./NotFoundAndSkipRenderOnServerContext";

global.fetch = fetch as any;

type RequestContext = {
  request: Request;
  manifest?: Record<string, string[]>;
  renderTemplate(opts: { preloadHtml: string; appHtml: string }): string;
};

async function onGet({
  request,
  manifest,
  renderTemplate,
}: RequestContext): Promise<Response> {
  const url = request.url.replace(/\.json$/, "");
  const found = matchRoutes(routes, url) ?? [];
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

  if (
    request.url.endsWith(".json") ||
    request.headers.get("accept")?.includes("application/json")
  ) {
    return new Response(JSON.stringify({ data: [...loaderContext] }), {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  const scripts =
    buildScripts(
      foundRouteKeys.map((x) => x.routeKey),
      manifest
    ) + (await buildWindowValues(found, loaderContext, status));

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
  manifest?: Record<string, string[]>
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

  return _(routeKeys)
    .map((routeFile) => `/app/routes/${routeFile}`)
    .map((url) => {
      return ReactDOMServer.renderToStaticMarkup(
        <link rel="modulepreload" href={url} />
      );
    })
    .join("");
}

async function buildWindowValues(
  routes: RouteMatch[],
  loaderContext: Map<string, unknown>,
  splashState: number
): Promise<string> {
  const allRoutes = await buildRouteDefinitionBag(
    Object.keys(routesObject).map((x) => ({
      routeKey: x.replace("../app/routes/", ""),
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

function mapKeys<K, V, R>(map: Map<K, V>, f: (k: K) => R): Map<R, V> {
  const newMap = new Map<R, V>();
  for (const [key, value] of map) {
    newMap.set(f(key), value);
  }
  return newMap;
}
