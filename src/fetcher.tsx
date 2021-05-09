import { useLocation } from "react-router";
import useSWR from "swr";
import React from "react";
import { LoaderContext, useRouteData } from "./LoaderContext";
import { RouteKeyContext } from "./routeTreeIntoReactRouterRoute";

export function useFetcher<A>() {
  const location = useLocation();
  const routeKey = React.useContext(RouteKeyContext);
  const initialData = useRouteData<A>();
  const cacheContext = React.useContext(LoaderContext);
  const fetcher = React.useMemo(() => createFetcher(cacheContext), [
    cacheContext,
  ]);
  const swr = useSWR<A>(
    () => [routeKey, `${location.pathname}${location.search}`],
    {
      fetcher,
      initialData,
    }
  );
  return swr.data;
}

function createFetcher(cacheContext: Map<string, unknown>) {
  return async function <A>(key: string, url: string): Promise<A> {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    const json = await response.json();
    const map = new Map<string, unknown>(json.data);
    for (const [key, value] of map) {
      cacheContext.set(key, value);
    }
    return cacheContext.get(key) as A;
  };
}
