import React from "react";
import type { RouteFile } from "./fsRoutes";
import { ErrorBoundary } from "./ErrorBoundary";

type State =
  | {
      tag: "loading";
    }
  | {
      tag: "error";
      error: unknown;
    }
  | {
      tag: "loaded";
      component: React.ComponentType;
      errorBoundary?: React.ComponentType;
    };

export function dynamicImportComponent(
  key: string,
  p: () => Promise<RouteFile>
): React.ComponentType {
  return () => <DynamicImportComponent component={p} contextKey={key} />;
}

export const DynamicImportComponentContext = React.createContext<
  Map<
    string,
    { component: React.ComponentType; errorBoundary?: React.ComponentType }
  >
>(new Map());

export function DynamicImportComponent({
  contextKey,
  ...props
}: Omit<
  Parameters<typeof DynamicImportComponentRenderer>[0],
  "initialState"
> & { contextKey: string }) {
  const ctx = React.useContext(DynamicImportComponentContext);
  const immediate = ctx.get(contextKey);

  return (
    <DynamicImportComponentRenderer
      {...props}
      initialState={
        immediate && {
          tag: "loaded",
          component: immediate.component,
          errorBoundary: immediate.errorBoundary,
        }
      }
      contextKey={contextKey}
    />
  );
}

export function DynamicImportComponentRenderer(props: {
  component: () => Promise<RouteFile>;
  initialState?: State;
  loadingElement?: React.ReactNode;
  contextKey?: string;
}): React.ReactElement {
  const ctx = React.useContext(DynamicImportComponentContext);

  const [state, setState] = React.useState<State>(
    props.initialState ?? { tag: "loading" }
  );

  React.useEffect(() => {
    if (state.tag !== "loading") {
      return;
    }

    props
      .component()
      .then((mod) => {
        if (!mod.default) {
          setState({
            tag: "error",
            error: `Module does not have a valid React.Component exported from default export`,
          });
        } else {
          setState({
            tag: "loaded",
            component: mod.default,
            errorBoundary: mod.ErrorBoundary,
          });
          if (props.contextKey) {
            ctx.set(props.contextKey, {
              component: mod.default,
              errorBoundary: mod.ErrorBoundary,
            });
          }
        }
      })
      .catch((err) => {
        setState({ tag: "error", error: err });
      });
  }, [state, props.component]);

  switch (state.tag) {
    case "loading": {
      return <>{props.loadingElement ?? null}</>;
    }
    case "error": {
      return <div>Error: {String(state.error)}</div>;
    }
    case "loaded": {
      if (state.errorBoundary) {
        return (
          <ErrorBoundary fallbackComponent={state.errorBoundary as any}>
            <state.component />
          </ErrorBoundary>
        );
      }
      return <state.component />;
    }
  }
}
