import { Navigator, Router, matchRoutes } from "react-router";
import { BrowserHistory, createBrowserHistory, Location } from "history";
import React from "react";
import { routeElementsObject, routesObject } from "./App";
import { LoaderContext } from "./LoaderContext";

const routingContext = new Map(__REMASTERED_ROUTE_DEFS);

type PendingState<T> = { value: T; tx: string };
function usePendableState<T>(
  initialValue: T
): {
  currentValue: T;
  pendingState: PendingState<T> | null;
  commit(tx: string): void;
  rollback(tx: string): void;
  begin(t: T): void;
} {
  const [
    pendingState,
    setPendingState,
  ] = React.useState<PendingState<T> | null>(null);
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
  const historyRef = React.useRef<BrowserHistory>();
  if (!historyRef.current) {
    historyRef.current = createBrowserHistory({ window: props.window });
  }
  const history = historyRef.current;
  const loaderContextRef = React.useRef(props.initialLoaderContext);
  const [loaderContext, setLoaderContext] = React.useState(
    loaderContextRef.current
  );
  const { currentValue: state, commit, pendingState, begin } = usePendableState(
    {
      action: history.action,
      location: history.location,
    }
  );

  React.useEffect(() => {
    return history.listen((state) => {
      begin(state);
    });
  }, []);

  React.useEffect(() => {
    const abortController = new AbortController();
    if (pendingState) {
      handlePendingState(
        pendingState,
        commit,
        abortController.signal,
        (newMap) => {
          const mergedMap = new Map([...loaderContextRef.current, ...newMap]);
          loaderContextRef.current = mergedMap;
          setLoaderContext(mergedMap);
        },
        props.loadedComponentContext
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
      <Router
        location={state.location}
        action={state.action}
        children={props.children}
        navigator={navigator}
      />
    </LoaderContext.Provider>
  );
}

async function fetching(url: string, signal: AbortSignal): Promise<unknown> {
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal,
  });
  const json = await response.json();
  return json.data;
}

async function handlePendingState(
  pendingState: PendingState<{ location: Location }>,
  commit: (tx: string) => void,
  signal: AbortSignal,
  setLoaderContext: (map: Map<string, unknown>) => void,
  componentContext: Map<string, React.ComponentType>
) {
  const matches = matchRoutes(routeElementsObject, pendingState.value.location);

  const loaders = (matches ?? []).map(async (routeMatch) => {
    const routeFile = (routeMatch.route as any).routeFile;
    const key = `../app/routes/${routeFile}`;
    const entry = await routesObject[key]?.();
    componentContext.set(key, entry.default);
  });

  const lastMatch = matches?.slice(-1)[0];
  if (lastMatch) {
    const routeFile = (lastMatch.route as any).routeFile;
    const routeInfo = routingContext.get(`../app/routes/${routeFile}`);

    if (routeInfo && routeInfo.hasLoader) {
      const url = `${pendingState.value.location.pathname}.json${pendingState.value.location.search}`;

      const result = await fetching(url, signal);
      const newMap = new Map<string, unknown>(result as any);
      setLoaderContext(newMap);
    }
  }

  await Promise.all(loaders);

  commit(pendingState.tx);
}
