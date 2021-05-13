import ReactDOMServer from "react-dom/server";
import React from "react";
import { routeElementsObject as routes, routesObject } from "./fsRoutes";
import { matchRoutes, matchPath, RouteMatch } from "react-router";
import { RouteObjectWithFilename } from "./routeTreeIntoReactRouterRoute";
import _ from "lodash";
import { buildRouteDefinitionBag } from "./buildRouteComponentBag";
import fetch, { Response, Request } from "node-fetch";
import { mapValues, mapKeys } from "./Map";
import type { ViteDevServer } from "vite";
import {
  RemasteredAppServer,
  RemasteredAppServerCtx,
} from "./RemasteredAppServer";
import { LinkTag, ScriptTag } from "./JsxForDocument";

global.fetch = fetch as any;

type RequestContext = {
  request: Request;
  manifest?: Record<string, string[]>;
  renderTemplate(opts: { preloadHtml: string; appHtml: string }): string;
  viteDevServer?: ViteDevServer;
  clientManifest?: import("vite").Manifest;
};

async function onGet({
  request,
  manifest,
  viteDevServer,
  clientManifest,
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
  const links = buildScripts(routeKeys, manifest, viteDevServer);

  const mainScripts = await mainScript(clientManifest, viteDevServer);
  const inlineScript = await buildWindowValues(
    found,
    loaderContext,
    status,
    links,
    mainScripts
  );
  const scripts = [inlineScript, ...mainScripts];

  const remasteredAppContext: RemasteredAppServerCtx = {
    loadingErrorContext: {
      state: new Map([["default", loaderNotFound ? "not_found" : "ok"]]),
    },
    links,
    loaderContext: mapKeys(loaderContext, (a) => `default@${a}`),
    loadedComponentsContext: loadedComponents,
    requestedUrl: url,
    scripts,
  };

  const string = ReactDOMServer.renderToString(
    <RemasteredAppServer ctx={remasteredAppContext} />
  );

  return new Response(string, {
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
      const routeKey = (a.route as RouteObjectWithFilename).routeFile;
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
): LinkTag[] {
  if (manifest) {
    const preload = _(manifest)
      .entries()
      .filter(([key]) => {
        return routeKeys.some((routeKey) => {
          return key.endsWith(routeKey);
        });
      })
      .map(([, v]) => v)
      .flatten()
      .map(
        (url): LinkTag => {
          const rel = url.endsWith(".css") ? "stylesheet" : "modulepreload";
          return { rel, href: url };
        }
      )
      .value();

    return preload;
  }

  const preloadLinks = getPreloadFromVite(vite, routeKeys);

  const elms = _([...preloadLinks])
    .map(([url]) => {
      return { rel: "modulepreload", href: url };
    })
    .value();
  return elms;
}

async function buildWindowValues(
  routes: RouteMatch[],
  loaderContext: Map<string, unknown>,
  splashState: number,
  links: LinkTag[],
  scripts: ScriptTag[]
): Promise<ScriptTag> {
  const allRoutes = await buildRouteDefinitionBag(
    Object.keys(routesObject).map((routeKey) => ({ routeKey }))
  );
  const routeFiles = _(routes)
    .map((route) => {
      return (route.route as RouteObjectWithFilename).routeFile;
    })
    .compact()
    .value();
  const data = {
    __REMASTERED_LINK_TAGS: links,
    __REMASTERED_SCRIPT_TAGS: scripts,
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
  return {
    id: "remastered--remove-me",
    contents: stringified,
    type: "text/javascript",
  };
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
    .map((x) => `${process.cwd()}${x}`)
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

async function mainScript(
  regularManifest?: import("vite").Manifest,
  vite?: ViteDevServer
): Promise<ScriptTag[]> {
  if (vite) {
    const {
      default: { preambleCode },
    } = await import("@vitejs/plugin-react-refresh");
    return [
      { contents: preambleCode.replace("__BASE__", "/"), type: "module" },
      { src: "/@vite/client", type: "module" },
      { src: "/src/main.tsx", type: "module" },
    ];
  } else if (regularManifest) {
    return [{ src: regularManifest["src/main.tsx"].file, type: "module" }];
  }
  return [];
}
