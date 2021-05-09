import { useLocation } from "react-router";
import React from "react";
import { LoaderContext, useRouteData } from "./LoaderContext";
import { RouteKeyContext } from "./routeTreeIntoReactRouterRoute";

type FetchState =
  | { state: "loading" }
  | { state: "error"; error: unknown }
  | { state: "done"; value: unknown };
export function useFetcher<A>() {
  const routeKey = React.useContext(RouteKeyContext);
  const fetched = useFetcherWithoutDefault<A>(routeKey ?? "");
  if (fetched.state === "done") {
    return fetched.value as A;
  } else {
    return undefined;
  }
}

export function useFetcherWithoutDefault<A>(routeKey: string) {
  const location = useLocation();
  const initialData = useRouteData<A>();
  const cacheContext = React.useContext(LoaderContext);
  const urlToQuery = `${location.pathname}${location.search}`;

  const [state, setState] = React.useState<FetchState>({
    state: "done",
    value: initialData,
  });
  const [isFirstRun, setIsFirstRun] = React.useState(true);

  React.useEffect(() => {
    if (isFirstRun) {
      setIsFirstRun(false);
      return;
    }
    setState({ state: "loading" });
    fetching(urlToQuery).then((values) => {
      for (const [key, value] of new Map<string, unknown>(
        values as [string, string][]
      )) {
        cacheContext.set(key as string, value);
      }

      setState({ state: "done", value: cacheContext.get(routeKey ?? "") });
    });
  }, [urlToQuery, cacheContext, routeKey]);

  return state;
  /* const swr = useSWR<A>( */
  /*   () => [routeKey, `${location.pathname}${location.search}`], */
  /*   { */
  /*     initialData, */
  /*     revalidateOnFocus: false, */
  /*     revalidateOnMount: false, */
  /*   } */
  /* ); */
  /* return swr.data; */
}

async function fetching(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });
  const json = await response.json();
  return json.data;
}

export function createFetcher(cacheContext: Map<string, unknown>) {
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
