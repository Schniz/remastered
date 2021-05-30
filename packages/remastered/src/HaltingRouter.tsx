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
import { LoaderContext } from "./LoaderContext";
import { NotFoundAndSkipRenderOnServerContext } from "./NotFoundAndSkipRenderOnServerContext";
import { MatchesContext } from "./useMatches";
import { PendingLocationContext } from "./PendingLocation";
import { REMASTERED_JSON_ACCEPT } from "./constants";
import { wrapRoutes } from "./wrapRoutes";
import {
  deserializeResponse,
  isSerializedResponse,
} from "./SerializedResponse";

type PendingState<T> = { value: T; tx: string };
function usePendableState<T>(initialValue: T): {
  currentValue: T;
  pendingState: PendingState<T> | null;
  commit(tx: string): void;
  rollback(tx: string): void;
  begin(t: T): void;
} {
  const [pendingState, setPendingState] =
    React.useState<PendingState<T> | null>(null);
  const [currentValue, setCurrentValue] = React.useState(initialValue);

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
  const begin = React.useCallback(
    (t: T) => setPendingState({ value: t, tx: String(Math.random) }),
    []
  );

  return {
    currentValue,
    pendingState,
    commit,
    rollback,
    begin,
  };
}

export function HaltingRouter(props: {
  children: React.ReactNode | React.ReactNode[];
  window?: Window;
  initialLoaderContext: Map<string, unknown>;
  loadedComponentContext: Map<string, React.ComponentType>;
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
  } = usePendableState({
    action: history.action,
    location: history.location,
  });

  React.useEffect(() => {
    if (import.meta.env.MODE === "development") {
      (window as any).__$$refresh_remastered$$__ = () =>
        navigator.replace(history.location);
    }

    return history.listen((state) => {
      begin(state);
    });
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
        navigator,
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
          historyResponseState.state?.set(
            pendingState.value.location.key,
            "not_found"
          )
      );
    }

    return () => abortController.abort();
  }, [pendingState]);

  const navigator = React.useMemo(
    (): Navigator => ({
      go(delta) {
        history.go(delta);
      },
      push(to, state) {
        history.push(to, state);
      },
      block(blocker) {
        return () => {
          history.block(blocker)();
        };
      },
      createHref(to) {
        return history.createHref(to);
      },
      replace(to) {
        history.replace(to);
      },
    }),
    [historyRef]
  );

  return (
    <LoaderContext.Provider value={loaderContext}>
      <PendingLocationContext.Provider value={pendingState?.value?.location}>
        <Router
          location={state.location}
          action={state.action}
          children={props.children}
          navigator={navigator}
        />
      </PendingLocationContext.Provider>
    </LoaderContext.Provider>
  );
}

async function fetching(
  url: string,
  signal: AbortSignal
): Promise<{ data: unknown; status: number }> {
  const response = await fetch(url, {
    headers: { Accept: REMASTERED_JSON_ACCEPT },
    signal,
  });
  const json = await response.json();
  return { data: json.data, status: response.status };
}

async function handlePendingState(
  currentState: { location: Location; action: Action },
  pendingState: PendingState<{ location: Location; action: Action }>,
  commit: (tx: string) => void,
  navigator: Navigator,
  signal: AbortSignal,
  setLoaderContext: (map: Map<string, unknown>) => void,
  loaderContext: Map<string, unknown>,
  componentContext: Map<string, React.ComponentType>,
  matchesContext: React.ContextType<typeof MatchesContext>,
  onNotFound: () => void
) {
  const { newRoutes, keepRoutes } = diffRoutes(
    currentState,
    pendingState.value
  );
  const routesObject = getRoutesObject();

  const components = newRoutes.map(async (routeMatch) => {
    const routeFile = (routeMatch.route as any).routeFile;
    const key = `${routeFile}`;
    let entry = (await routesObject[key]?.()) ?? matchesContext.get(key);
    if (!entry) {
      return;
    }
    if (entry.default) {
      componentContext.set(key, entry.default);
    }
    matchesContext.set(key, {
      hasLoader: false,
      ...matchesContext.get(key),
      handle: entry.handle,
      meta: entry.meta,
    });
  });

  const newMap = new Map<string, unknown>();
  let hold = false;

  keepRoutes.forEach((route) => {
    const routeFile = (route.route as any).routeFile;
    const routingKey = `${routeFile}`;
    const routeInfo = matchesContext.get(routingKey);
    const pendingStorageKey = `${pendingState.value.location.key}@${routingKey}`;
    const currentStorageKey = `${currentState.location.key}@${routingKey}`;

    if (loaderContext.has(currentStorageKey)) {
      newMap.set(pendingStorageKey, loaderContext.get(currentStorageKey));
    } else {
      if (routeInfo && routeInfo.hasLoader) {
        newRoutes.unshift(route);
      }
    }
  });

  const loaders = newRoutes.map(async (lastMatch) => {
    const isExact = lastMatch.pathname === pendingState.value.location.pathname;
    const routeFile = (lastMatch.route as any).routeFile;
    const routingKey = `${routeFile}`;
    const routeInfo = matchesContext.get(routingKey);
    const storageKey = `${pendingState.value.location.key}@${routingKey}`;

    if (routeInfo && routeInfo.hasLoader) {
      if (lastMatch.pathname !== "/" && lastMatch.pathname.endsWith("/")) {
        return;
      }
      if (
        pendingState.value.action !== Action.Pop ||
        !loaderContext.has(storageKey)
      ) {
        const url = `${lastMatch.pathname}.json`;

        const { data: result, status } = await fetching(url, signal);
        const migrated = (result as [string, unknown][]).map(
          ([key, value]) =>
            [`${pendingState.value.location.key}@${key}`, value] as const
        );

        for (const [, value] of result as [string, unknown][]) {
          if (isSerializedResponse(value) && isExact) {
            const response = deserializeResponse(value);
            if (applyResponse(response, navigator)) {
              hold = true;
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

function diffRoutes(
  currentState: { location: Location; action: Action },
  pendingState: { location: Location; action: Action }
): { newRoutes: RouteMatch[]; keepRoutes: RouteMatch[] } {
  const routeElements = wrapRoutes(getRouteElements());
  const pendingRoutes = matchRoutes(routeElements, pendingState.location) ?? [];
  const currentMatches = (
    matchRoutes(routeElements, currentState.location) ?? []
  ).map((route) => {
    return `${route.pathname}/${JSON.stringify(route.params)}`;
  });

  const keepRoutes: RouteMatch[] = [];
  const newRoutes: RouteMatch[] = [];

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

/** This is not SPA stuff right now because I'm lazy, but it should be
 * using the same API of PendingLocation */
function applyResponse(response: Response, navigator: Navigator): boolean {
  if ([301, 302].includes(response.status)) {
    if (response.headers.get("location")) {
      navigator.replace(response.headers.get("location")!);
      return true;
    }
  }

  return false;
}
