import ReactDOMServer from "react-dom/server";
import React from "react";
import App, { routeElementsObject } from "./App";
import { MemoryRouter, matchRoutes, RouteMatch } from "react-router";
import { CustomRouteObject } from "./routeTreeIntoReactRouterRoute";
import _ from "lodash";
import { DynamicImportComponentContext } from "./DynamicImportComponent";
import { buildRouteComponentBag } from "./buildRouteComponentBag";

export async function render(
  url: string,
  manifest?: Record<string, string[]>
): Promise<{ app: string; scripts: string }> {
  const routes = routeElementsObject;
  const found = matchRoutes(routes, url) ?? [];
  const foundRouteKeys = getRouteKeys(found);
  const loadedComponents = await buildRouteComponentBag(foundRouteKeys);

  const scripts =
    buildScripts(foundRouteKeys, manifest) + buildWindowValues(found);

  const string = ReactDOMServer.renderToString(
    <DynamicImportComponentContext.Provider value={loadedComponents}>
      <MemoryRouter initialEntries={[url]} initialIndex={0}>
        <App />
      </MemoryRouter>
    </DynamicImportComponentContext.Provider>
  );
  return { app: string, scripts };
}

function getRouteKeys(routes: RouteMatch[]): string[] {
  return _(routes)
    .map((a) => a.route)
    .map<string | undefined>((a: CustomRouteObject) => a.routeFile)
    .compact()
    .value();
}

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

function buildWindowValues(routes: RouteMatch[] | null): string {
  if (!routes) return "";
  const routeFiles = _(routes)
    .map((route) => {
      return (route.route as CustomRouteObject).routeFile;
    })
    .compact()
    .value();
  return `<script>window.__REMASTERED_SSR_ROUTES=JSON.parse(${JSON.stringify(
    JSON.stringify(routeFiles)
  )})</script>`;
}
