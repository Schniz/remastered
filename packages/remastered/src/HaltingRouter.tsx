import {
  Navigator,
  Router,
  matchRoutes,
  matchPath,
  RouteMatch,
} from "react-router";
import {
  Action,
  BrowserHistory,
  createBrowserHistory,
  Location,
} from "history";
import React from "react";
import { getRouteElements, getRoutesObject } from "./fsRoutes";
import { LoaderContext, Result } from "./LoaderContext";
import { NotFoundAndSkipRenderOnServerContext } from "./NotFoundAndSkipRenderOnServerContext";
import { MatchesContext } from "./useMatches";
import { PendingLocationContext } from "./PendingLocation";
import { REMASTERED_JSON_ACCEPT } from "./constants";
import { wrapRoutes } from "./wrapRoutes";
import {
  deserializeResponse,
  isSerializedResponse,
} from "./SerializedResponse";
import { RemasteredAppContext } from "./WrapWithContext";

/**
 * An in-progress transaction value
 */
type PendingState<T> = { value: T; tx: string };

/**
 * A transactional state. Much like a normal `useState`, but applying a new state
 * requires a two-step process: calling `begin` (like `setState`) and then `commit(pendingState.tx)`.
 *
 * > Note: The `tx` (transaction token) is important to eliminate race conditions.
 */
function useTransactionalState<T>(initialValue: T): {
  /** The last committed value */
  currentValue: T;
  /** An in-progress transaction */
  pendingState: PendingState<T> | null;
  /** Commit a transaction using `pendingState.tx` */
  commit(tx: string): void;
  /** Roll-back a transaction using `pendingState.tx` */
  rollback(tx: string): void;
  /** Start a new transaction */
  begin(t: T): void;
  /** Immediately commit after beginning a session */
  setCurrentValueImmediately(t: T): void;
} {
  const [pendingState, setPendingState] =
    React.useState<PendingState<T> | null>(null);
  const [currentValue, setCurrentValue] = React.useState(initialValue);

  /* React.useEffect(() => { */
  /*   console.log({ pendingState, currentValue }); */
  /* }, [pendingState, currentValue]); */

  const commit = React.useCallback(
    (tx: string) => {
      if (pendingState && pendingState.tx === tx) {
        setCurrentValue(pendingState.value);
        setPendingState(null);
      }
    },
    [pendingState]
  );
  const rollback = React.useCallback(() => setPendingState(null), []);
  const begin = React.useCallback((t: T) => {
    const tx = String(Math.random());
    setPendingState({ value: t, tx });
  }, []);
  const setCurrentValueImmediately = React.useCallback((t: T) => {
    rollback();
    setCurrentValue(t);
  }, []);

  return {
    currentValue,
    pendingState,
    commit,
    rollback,
    begin,
    setCurrentValueImmediately,
  };
}

function getInitialLocation(
  _initialLoaderContext: React.ContextType<typeof LoaderContext>
): Location {
  return {
    key: "default",
    state: window.history.state?.usr,
    search: "",
    hash: "",
    pathname: __REMASTERED_CTX.path,
  };
}

/**
 * This is a custom React Router router that will "halt" navigation
 * in order to download the dynamically loaded components (the routes)
 * and their corresponding "loader"s.
 *
 * Internally it uses a transactional state to manage everything and the `handlePendingState`
 * mega-function, that we might split in the future.
 */
export function HaltingRouter(props: {
  children: React.ReactNode | React.ReactNode[];
  window?: Window;
  initialLoaderContext: React.ContextType<typeof LoaderContext>;
  loadedComponentContext: RemasteredAppContext["loadedComponentsContext"];
}) {
  const historyResponseState = React.useContext(
    NotFoundAndSkipRenderOnServerContext
  );
  const matchesContext = React.useContext(MatchesContext);
  const historyRef = React.useRef<BrowserHistory>();
  if (!historyRef.current) {
    historyRef.current = createBrowserHistory({ window: props.window });
  }
  const history = historyRef.current;
  const loaderContextRef = React.useRef(props.initialLoaderContext);
  const [loaderContext, setLoaderContext] = React.useState(
    loaderContextRef.current
  );
  const {
    currentValue: state,
    commit,
    pendingState,
    begin,
  } = useTransactionalState({
    action: Action.Pop,
    location: getInitialLocation(loaderContextRef.current),
  });

  React.useEffect(() => {
    if (import.meta.env.MODE === "development") {
      (window as any).__$$refresh_remastered$$__ = () =>
        history.replace(history.location);
    }

    const unsubscribe = history.listen((state) => {
      begin(state);
    });

    if (history.location.pathname !== state.location.pathname) {
      history.replace(history.location);
    }

    return unsubscribe;
  }, []);

  React.useEffect(() => {
    const abortController = new AbortController();
    if (pendingState) {
      handlePendingState(
        state,
        pendingState,
        (tx) => {
          commit(tx);

          // Remove dangling keys when we replace history
          if (pendingState.value.action === Action.Replace) {
            const replaced = [...loaderContextRef.current].filter(
              ([key]) => !key.startsWith(`${state.location.key}@`)
            );
            loaderContextRef.current = new Map(replaced);
            setLoaderContext(loaderContextRef.current);
          }
        },
        history,
        abortController.signal,
        (newMap) => {
          const mergedMap = new Map([...loaderContextRef.current, ...newMap]);
          loaderContextRef.current = mergedMap;
          setLoaderContext(mergedMap);
        },
        loaderContextRef.current,
        props.loadedComponentContext,
        matchesContext,
        () =>
          historyResponseState.set(pendingState.value.location.key, {
            tag: "not_found",
          })
      );
    }

    return () => abortController.abort();
  }, [pendingState]);

  return (
    <LoaderContext.Provider value={loaderContext}>
      <PendingLocationContext.Provider value={pendingState?.value?.location}>
        <Router
          location={state.location}
          action={state.action}
          children={props.children}
          navigator={history}
        />
      </PendingLocationContext.Provider>
    </LoaderContext.Provider>
  );
}

async function fetching(
  url: string,
  signal: AbortSignal
): Promise<{ data: [string, Result<unknown, unknown>][]; status: number }> {
  const response = await fetch(url, {
    headers: { Accept: REMASTERED_JSON_ACCEPT },
    signal,
  });
  const json = await response.json();
  if (!Array.isArray(json.data)) {
    throw new Error("Incompatible response");
  }
  return { data: json.data, status: response.status };
}

async function handlePendingState(
  currentState: { location: Location; action: Action },
  pendingState: PendingState<{ location: Location; action: Action }>,
  commit: (tx: string) => void,
  navigator: Navigator,
  signal: AbortSignal,
  setLoaderContext: (map: RemasteredAppContext["loaderContext"]) => void,
  loaderContext: RemasteredAppContext["loaderContext"],
  componentContext: RemasteredAppContext["loadedComponentsContext"],
  matchesContext: React.ContextType<typeof MatchesContext>,
  onNotFound: () => void
) {
  const { newRoutes, keepRoutes } = diffRoutes(
    currentState,
    pendingState.value
  );
  const routesObject = getRoutesObject();

  const components = newRoutes.map(async (routeMatch) => {
    const { routeFile } = routeMatch.route;
    // TODO: what if we fail to grab a route? let's make a hard-refresh maybe?
    let entry =
      (await routesObject[routeFile]?.()) ?? matchesContext.get(routeFile);
    if (!entry) {
      return;
    }
    if (entry.default) {
      componentContext.set(routeFile, {
        component: entry.default,
        errorBoundary: entry.ErrorBoundary,
      });
    }
    matchesContext.set(routeFile, {
      hasLoader: false,
      ...matchesContext.get(routeFile),
      handle: entry.handle,
      meta: entry.meta,
    });
  });

  const newMap: RemasteredAppContext["loaderContext"] = new Map();
  let hold = false;

  keepRoutes.forEach((route) => {
    const { routeFile } = route.route;
    const routeInfo = matchesContext.get(routeFile);
    const pendingStorageKey = `${pendingState.value.location.key}@${routeFile}`;
    const currentStorageKey = `${currentState.location.key}@${routeFile}`;

    if (loaderContext.has(currentStorageKey)) {
      newMap.set(pendingStorageKey, loaderContext.get(currentStorageKey)!);
    } else {
      if (routeInfo && routeInfo.hasLoader) {
        newRoutes.unshift(route);
      }
    }
  });

  const loaders = newRoutes.map(async (lastMatch) => {
    const isExact =
      lastMatch.pathname.replace(/\/$/, "") ===
      pendingState.value.location.pathname;
    const { routeFile } = lastMatch.route;
    const routeInfo = matchesContext.get(routeFile);
    const storageKey = `${pendingState.value.location.key}@${routeFile}`;

    if (routeInfo && routeInfo.hasLoader) {
      /* if (lastMatch.pathname !== "/" && lastMatch.pathname.endsWith("/")) { */
      /*   return; */
      /* } */
      if (
        pendingState.value.action !== Action.Pop ||
        !loaderContext.has(storageKey)
      ) {
        const url = `${lastMatch.pathname}.loader.json`;

        const { data: result, status } = await fetching(url, signal);
        const migrated = result.map(
          ([key, value]) =>
            [`${pendingState.value.location.key}@${key}`, value] as const
        );

        for (const [, loaderResult] of result) {
          if (loaderResult.tag === "ok") {
            if (isSerializedResponse(loaderResult.value) && isExact) {
              const response = deserializeResponse(loaderResult.value);
              if (applyResponse(response, navigator)) {
                hold = true;
              }
            }
          }
        }

        if (status === 404) {
          onNotFound();
        } else {
          for (const [key, value] of migrated) {
            newMap.set(key, value);
          }
        }
      } else {
        console.log("cache hit");
      }
    }
  });

  await Promise.all([Promise.all(components), Promise.all(loaders)]);
  setLoaderContext(newMap);

  if (!hold) {
    commit(pendingState.tx);
  }
}

type RemasteredRouteMatch = RouteMatch & {
  route: RouteMatch["route"] & { routeFile: string };
};

function diffRoutes(
  currentState: { location: Location; action: Action },
  pendingState: { location: Location; action: Action }
): { newRoutes: RemasteredRouteMatch[]; keepRoutes: RemasteredRouteMatch[] } {
  const routeElements = wrapRoutes(getRouteElements());
  const pendingRoutes =
    (matchRoutes(
      routeElements,
      pendingState.location
    ) as RemasteredRouteMatch[]) ?? [];
  const currentMatches = (
    matchRoutes(routeElements, currentState.location) ?? []
  ).map((route) => {
    return `${route.pathname}/${JSON.stringify(route.params)}`;
  });

  const keepRoutes: RemasteredRouteMatch[] = [];
  const newRoutes: RemasteredRouteMatch[] = [];

  for (const route of pendingRoutes) {
    const key = `${route.pathname}/${JSON.stringify(route.params)}`;
    if (currentMatches.includes(key)) {
      keepRoutes.push(route);
    } else {
      newRoutes.push(route);
    }
  }

  if (newRoutes.length) {
    return { keepRoutes, newRoutes };
  } else {
    const newRoutes = pendingRoutes.filter((route) => {
      return matchPath(route.pathname, pendingState.location.pathname);
    });
    const keepRoutes = pendingRoutes.filter((x) => !newRoutes.includes(x));
    return { newRoutes, keepRoutes };
  }
}

if (import.meta.hot) {
  import.meta.hot!.on("remastered:server-module-updated", () => {
    (window as any).__$$refresh_remastered$$__();
  });
}

/**
 * A very ugly implementation of redirects for responses
 *
 * TODO think about error handling here...
 */
function applyResponse(response: Response, navigator: Navigator): boolean {
  if ([301, 302].includes(response.status)) {
    if (response.headers.get("location")) {
      navigator.replace(response.headers.get("location")!);
      return true;
    }
  }

  return false;
}
