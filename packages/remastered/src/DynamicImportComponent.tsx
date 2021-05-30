import React from "react";
import { RouteFile } from "./fsRoutes";

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
    };

export function dynamicImportComponent(
  key: string,
  p: () => Promise<{ default?: React.ComponentType }>
): React.ComponentType {
  return () => <DynamicImportComponent component={p} contextKey={key} />;
}

export const DynamicImportComponentContext = React.createContext<
  Map<string, React.ComponentType>
>(new Map());

export function DynamicImportComponent({
  contextKey,
  ...props
}: Omit<
  Parameters<typeof DynamicImportComponentRenderer>[0],
  "initialState"
> & { contextKey: string }) {
  const ctx = React.useContext(DynamicImportComponentContext);
  const component = ctx.get(contextKey);
  return (
    <DynamicImportComponentRenderer
      {...props}
      initialState={component && { tag: "loaded", component }}
      contextKey={contextKey}
    />
  );
}

export function DynamicImportComponentRenderer(props: {
  component: () => Promise<{ default?: React.ComponentType }>;
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
          setState({ tag: "loaded", component: mod.default });
          if (props.contextKey) {
            ctx.set(props.contextKey, mod.default);
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
      return <state.component />;
    }
  }
}
