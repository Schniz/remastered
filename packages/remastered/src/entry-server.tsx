import { globalPatch } from "./globalPatch";
globalPatch();

import React from "react";
import * as megajson from "./megajson";
import { getRouteElements, getRoutesObject } from "./fsRoutes";
import { matchRoutes, matchPath, RouteMatch } from "react-router";
import { RouteObjectWithFilename } from "./routeTreeIntoReactRouterRoute";
import { chain } from "lodash";
import { buildRouteDefinitionBag } from "./buildRouteComponentBag";
import { mapValues, mapKeys } from "./Map";
import { ModuleNode, ViteDevServer } from "vite";
import { AllLinkTags, LinkTag, ScriptTag } from "./JsxForDocument";
import { MatchesContext, RouteDef } from "./useMatches";
import { wrapRoutes } from "./wrapRoutes";
import { LayoutObject } from "./UserOverridableComponents";
import { LAYOUT_ROUTE_KEY } from "./magicConstants";
import { REMASTERED_JSON_ACCEPT } from "./constants";
import { serializeResponse } from "./SerializedResponse";
import { HttpRequest, HttpResponse, isHttpResponse } from "./HttpTypes";
import createDebugger from "debug";
import { RemasteredAppContext } from "./WrapWithContext";
import userCreateResponse from "glob-first:/app/entry.server.{t,j}s{x,};./defaultServerEntry.js";
import { RemasteredAppServer } from "./RemasteredAppServer";
import { RenderServerEntryOptions } from "./defaultServerEntry";
import {
  NotFoundAndSkipRenderOnServerContext,
  ResponseState,
} from "./NotFoundAndSkipRenderOnServerContext";
import { REMASTERED_JSON_FALLBACK_HEADER } from "./httpHelpers";
import { readMagicMethodQueryParam } from "./magicMethodSetter";

export const configs = import.meta.glob("/config/**/*.{t,j}s{x,}");

const mainFile = `node_modules/.remastered/entry.client.js`;

megajson.setup();

export type RequestContext = {
  request: HttpRequest;
  manifest?: Record<string, string[]>;
  viteDevServer?: ViteDevServer;
  clientManifest?: import("vite").Manifest;
};

async function checkTime<T>(tag: string, fn: () => Promise<T>): Promise<T> {
  const debug = createDebugger("remastered:time");
  const hrtime = Date.now();
  try {
    return await fn();
  } finally {
    const elapsed = Date.now() - hrtime;
    debug(`${tag} finished. time taken: ${elapsed}ms`);
  }
}

async function onGet({
  request,
  manifest,
  viteDevServer,
  clientManifest,
}: RequestContext): Promise<HttpResponse> {
  const routes = wrapRoutes(getRouteElements());
  const routesObject = {
    ...getRoutesObject(),
    [LAYOUT_ROUTE_KEY]: async () => LayoutObject,
  };

  const url = new URL(request.url, "http://example.com").pathname.replace(
    /\.loader\.json$/,
    ""
  );
  const isLoaderJsonResponse =
    request.url.endsWith(".loader.json") ||
    request.headers.get("accept")?.includes(REMASTERED_JSON_ACCEPT);

  let status = 200;

  let found = matchRoutes(routes, url) ?? [];
  const exactFound = found.filter((x) => matchPath(x.pathname, url));
  let loaderNotFound = false;

  const weHaveElementToRender = (
    exactFound.slice(-1)[0]?.route as RouteObjectWithFilename
  )?.hadElement;

  if (exactFound.length === 0 || !weHaveElementToRender) {
    loaderNotFound = true;
    status = 404;
  }

  if (isLoaderJsonResponse) {
    found = exactFound;
  }

  const foundRouteKeys = getRouteKeys(found);
  const relevantRoutes = await buildRouteDefinitionBag(
    foundRouteKeys,
    routesObject
  );
  const loadedComponents = mapValues(relevantRoutes, (x) => ({
    component: x.component,
    errorBoundary: x.errorBoundary,
  }));
  const loaderContext: RemasteredAppContext["loaderContext"] = new Map();
  const links: AllLinkTags[] = [];
  const headers = new Headers();

  for (const relevantRoute of relevantRoutes.values()) {
    if (relevantRoute.loader) {
      try {
        const params = relevantRoute.givenRoute.params;
        const loader = relevantRoute.loader;
        const loaderResult = await checkTime(
          `${relevantRoute.key} loader`,
          () =>
            loader({
              params,
              request,
            })
        );
        loaderContext.set(relevantRoute.key, {
          tag: "ok",
          value: loaderResult,
        });

        if (loaderResult === null || loaderResult === undefined) {
          loaderNotFound = true;
        }

        if (isHttpResponse(loaderResult)) {
          if (
            loaderResult.headers.get(REMASTERED_JSON_FALLBACK_HEADER) === "true"
          ) {
            loaderContext.set(relevantRoute.key, {
              tag: "ok",
              value: await loaderResult.json(),
            });
            status = loaderResult.status;
            loaderResult.headers.delete(REMASTERED_JSON_FALLBACK_HEADER);
            loaderResult.headers.delete("Content-Type");
            for (const [headerName, headerValue] of loaderResult.headers) {
              headers.set(headerName, headerValue);
            }
          } else if (isLoaderJsonResponse) {
            const serializedResponse = await serializeResponse(loaderResult);
            loaderContext.set(relevantRoute.key, {
              tag: "ok",
              value: serializedResponse,
            });
          } else {
            return loaderResult;
          }
        }
      } catch (e) {
        loaderContext.set(relevantRoute.key, {
          tag: "err",
          error: e,
        });
      }
    }
  }

  for (const relevantRoute of relevantRoutes.values()) {
    if (relevantRoute.links) {
      const routeLinks = (await relevantRoute.links()).map(
        (link): AllLinkTags => ({ _tag: "link", link })
      );
      links.push(...routeLinks);
    }
  }

  for (const relevantRoute of relevantRoutes.values()) {
    if (relevantRoute.headers) {
      const routeHeadersInit = await relevantRoute.headers({ request });
      const routeHeaders = new Headers(routeHeadersInit);

      for (const [key, value] of routeHeaders.entries()) {
        headers.append(key, value);
      }
    }
  }

  if (loaderNotFound) {
    status = 404;
  }

  if (isLoaderJsonResponse) {
    return new Response(
      await megajson.stringify({ data: [...loaderContext] }),
      {
        status,
        headers: {
          "Content-Type": "application/json+loader",
          ...Object.fromEntries(headers.entries()),
        },
      }
    );
  }

  const routeKeys = foundRouteKeys.map((x) => x.routeKey);
  const preloadLinks = buildScripts(
    routeKeys,
    manifest,
    viteDevServer,
    clientManifest
  );
  const scripts: ScriptTag[] = [];
  const matchesContext = mapValues(
    await buildRouteDefinitionBag(
      Object.keys(routesObject).map((routeKey) => ({ routeKey })),
      routesObject
    ),
    (v): RouteDef => {
      return {
        hasLoader: Boolean(v.loader),
        handle: v.handle,
        meta: v.meta,
        errorBoundary: v.errorBoundary,
      };
    }
  );

  for (const preloadLink of preloadLinks) {
    if (
      preloadLink.rel === "modulepreload" &&
      !preloadLink.href.endsWith(".css")
    ) {
      // Only preload on production, because in dev we have tons of files and it is making it slow
      if (!viteDevServer) {
        scripts.push({ _tag: "preload", src: preloadLink.href });
      }
    } else if (preloadLink.rel === "modulepreload") {
      // force load css
      links.push({ _tag: "script", script: { src: preloadLink.href } });
    } else {
      links.push({ _tag: "link", link: preloadLink });
    }
  }

  scripts.push(...(await mainScript(clientManifest, viteDevServer)));

  const routingRenderState: ResponseState = loaderNotFound
    ? { tag: "not_found" }
    : { tag: "ok" };

  const inlineScript = await buildWindowValues(
    found,
    loaderContext,
    new Map([["@default@", routingRenderState]]),
    links,
    scripts,
    matchesContext,
    request.url
  );

  scripts.unshift(inlineScript);

  const remasteredAppContext: RemasteredAppContext = {
    loadingErrorContext: new Map([["default", routingRenderState]]),
    links,
    loaderContext: mapKeys(loaderContext, (a) => `default@${a}`),
    loadedComponentsContext: loadedComponents,
    scripts,
    matchesContext,
    setStatusCode(number) {
      status = number;
    },
  };

  if (typeof userCreateResponse !== "function") {
    return new Response(
      `<h1>Error!</h1>Please export a function from the export default of your custom server entry.`,
      {
        status: 500,
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  }

  const renderServerEntryOptions: RenderServerEntryOptions = {
    request,
    Component: RemasteredAppServer,
    ctx: remasteredAppContext,
    getHttpStatus() {
      return status;
    },
    getHttpHeaders() {
      return headers;
    },
  };

  const response = await userCreateResponse(renderServerEntryOptions);

  return response;
}

export async function render(ctx: RequestContext): Promise<HttpResponse> {
  return checkTime(`request to ${ctx.request.url}`, async () => {
    if (ctx.request.method === "GET") {
      return await onGet(ctx);
    }
    const result = await onAction(ctx);
    if (!result) {
      return new Response("Not found", { status: 404 });
    }
    return result;
  });
}

export type RenderFn = typeof render;

async function onAction(
  ctx: RequestContext
): Promise<HttpResponse | undefined> {
  const routes = getRouteElements();

  const givenUrl = new URL(ctx.request.url, "https://example.com");
  const [overrideMethod, searchParams] = readMagicMethodQueryParam(
    givenUrl.searchParams
  );
  const searchParamsString = searchParams.toString();
  const newUrlString =
    ctx.request.url.split("?")[0] +
    (searchParamsString ? `?${searchParamsString}` : "");
  const request = new Request(newUrlString, {
    headers: ctx.request.headers as any,
    body: ctx.request.body as any,
    method: overrideMethod ?? ctx.request.method,
  });

  const url = request.url.replace(/\.json$/, "");
  const found = matchRoutes(routes, url) ?? [];
  const foundRouteKey = getRouteKeys(found).slice(-1)[0];
  if (!foundRouteKey) {
    return;
  }
  const relevantRouteBag = await buildRouteDefinitionBag(
    [foundRouteKey],
    getRoutesObject()
  );
  const route = [...relevantRouteBag.values()][0];

  if (!route.action) {
    return;
  }

  const isLoaderJsonResponse =
    request.headers.get("accept")?.includes(REMASTERED_JSON_ACCEPT) ?? false;

  const response$ = route.action({ request, params: foundRouteKey.params });
  if (!isLoaderJsonResponse) {
    return response$;
  }

  try {
    const response = await response$;
    const setCookie = response.headers.get("Set-Cookie");
    return new Response(await megajson.stringify(response), {
      headers: {
        "Content-Type": REMASTERED_JSON_ACCEPT,
        ...(setCookie && { "Set-Cookie": setCookie }),
      },
    });
  } catch (err) {
    return new Response(await megajson.stringify(err), {
      headers: {
        "Content-Type": REMASTERED_JSON_ACCEPT,
      },
    });
  }
}

function getRouteKeys(routes: RouteMatch[]): EnhancedRoute[] {
  return chain(routes)
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
  vite?: ViteDevServer,
  clientManifest?: import("vite").Manifest
): LinkTag[] {
  const links: LinkTag[] = [];
  if (manifest) {
    const preload = chain(manifest)
      .entries()
      .filter(([key]) => {
        return routeKeys.some((routeKey) => {
          return key.endsWith(routeKey);
        });
      })
      .map(([, v]) => v)
      .flatten()
      .map((url): LinkTag => {
        const rel = url.endsWith(".css") ? "stylesheet" : "modulepreload";
        return { rel, href: url };
      })
      .value();

    links.push(...preload);
  }

  if (clientManifest) {
    const manifested = (clientManifest[mainFile].css ?? []).map(
      (url): LinkTag => {
        return {
          rel: "stylesheet",
          href: `/${url}`,
        };
      }
    );
    links.push(...manifested);
  }

  if (vite) {
    const preloadLinks = getPreloadFromVite(vite, routeKeys);

    const elms = chain([...preloadLinks])
      .map(([url]) => {
        return { rel: "modulepreload", href: url };
      })
      .value();
    links.push(...elms);
  }

  return links;
}

async function buildWindowValues(
  routes: RouteMatch[],
  loaderContext: RemasteredAppContext["loaderContext"],
  routingErrors: React.ContextType<typeof NotFoundAndSkipRenderOnServerContext>,
  links: AllLinkTags[],
  scripts: ScriptTag[],
  matchesContext: React.ContextType<typeof MatchesContext>,
  url: string
): Promise<ScriptTag> {
  const routeFiles = chain(routes)
    .map((route) => {
      return (route.route as RouteObjectWithFilename).routeFile;
    })
    .compact()
    .value();
  const data: typeof __REMASTERED_CTX = {
    linkTags: links,
    scriptTags: scripts,
    routingErrors: routingErrors,
    ssrRoutes: routeFiles,
    loadCtx: loaderContext,
    routeDefs: matchesContext,
    path: url,
  };
  return {
    _tag: "eager",
    type: "text/javascript",
    contents: `window.__REMASTERED_CTX=JSON.parse(${JSON.stringify(
      await megajson.stringify(data)
    )});`,
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

  const moduleQueue = chain(routeKeys)
    .map((x) => `${process.cwd()}${x}`)
    .concat([`${process.cwd()}/${mainFile}`])
    .concat([`${process.cwd()}/app/layout.tsx`])
    .concat([`${process.cwd()}/app/layout.jsx`])
    .map((x) => vite.moduleGraph.fileToModulesMap.get(x))
    .compact()
    .flatMap((x) => [...x])
    .compact()
    .value();

  const visited = new Set<ModuleNode>();

  while (moduleQueue.length) {
    const moduleNode = moduleQueue.shift()!;
    if (visited.has(moduleNode)) continue;
    visited.add(moduleNode);
    resolvedModules.set(moduleNode.url, moduleNode.type);
    moduleQueue.push(...moduleNode.importedModules);
  }

  return resolvedModules;
}

async function mainScript(
  regularManifest?: import("vite").Manifest,
  vite?: ViteDevServer
): Promise<ScriptTag[]> {
  if (!import.meta.env.PROD && vite) {
    const {
      default: { preambleCode },
    } = await import("@vitejs/plugin-react-refresh");
    return [
      {
        _tag: "eager",
        contents: preambleCode.replace("__BASE__", "/"),
        type: "module",
      },
      { _tag: "eager", src: "/@vite/client", type: "module" },
      { _tag: "eager", src: `/${mainFile}`, type: "module" },
    ];
  } else if (regularManifest) {
    return [
      {
        _tag: "eager",
        src: "/" + regularManifest[mainFile].file,
        type: "module",
      },
    ];
  }
  return [];
}
