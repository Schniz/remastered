import ReactDOMServer from "react-dom/server";
import React from "react";
import App, { routeElementsObject, routesObject } from "./App";
import { matchRoutes, RouteMatch } from "react-router";
import { StaticRouter } from "react-router-dom/server";
import { CustomRouteObject } from "./routeTreeIntoReactRouterRoute";
import _ from "lodash";
import { DynamicImportComponentContext } from "./DynamicImportComponent";
import { buildRouteDefinitionBag, mapValues } from "./buildRouteComponentBag";
import { LoaderContext } from "./LoaderContext";
import fetch from "node-fetch";

global.fetch = fetch as any;

export type ResponseType =
  | {
      type: "json";
      value: unknown;
    }
  | {
      type: "html";
      value: string;
      scripts: string;
    };

export type ServerResponse = { content: ResponseType; status: number };

export async function render(
  request: Request,
  manifest?: Record<string, string[]>
): Promise<ServerResponse> {
  const url = request.url.replace(/\.json$/, "");
  const routes = routeElementsObject;
  const found = matchRoutes(routes, url) ?? [];
  const foundRouteKeys = getRouteKeys(found);
  const relevantRoutes = await buildRouteDefinitionBag(foundRouteKeys);
  const loadedComponents = mapValues(relevantRoutes, (x) => x.component);
  const loaderContext = new Map<string, unknown>();
  let loaderNotFound = false;

  for (const relevantRoute of relevantRoutes.values()) {
    if (relevantRoute.loader) {
      const loaderResult = await relevantRoute.loader({
        params: relevantRoute.givenRoute.params,
      });
      loaderContext.set(relevantRoute.key, loaderResult);

      if (loaderResult === null || loaderResult === undefined) {
        loaderNotFound = true;
      }
    }
  }

  if (loaderNotFound) {
    return {
      content: { type: "html", value: "Page not found", scripts: "" },
      status: 404,
    };
  }

  if (
    request.url.endsWith(".json") ||
    request.headers.get("accept")?.includes("application/json")
  ) {
    return {
      status: 200,
      content: { type: "json", value: { data: [...loaderContext] } },
    };
  }

  const scripts =
    buildScripts(
      foundRouteKeys.map((x) => x.routeKey),
      manifest
    ) + (await buildWindowValues(found, loaderContext));

  const string = ReactDOMServer.renderToString(
    <LoaderContext.Provider value={loaderContext}>
      <DynamicImportComponentContext.Provider value={loadedComponents}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </DynamicImportComponentContext.Provider>
    </LoaderContext.Provider>
  );
  return { content: { type: "html", value: string, scripts }, status: 200 };
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
        return <link rel="modulepreload" href={url} key={url} />;
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
  loaderContext: Map<string, unknown>
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

function mapToObject<K>(map: Map<string, K>): Record<string, K> {
  const obj: Record<string, K> = {};
  for (const [key, value] of map) {
    obj[key] = value;
  }
  return obj;
}
