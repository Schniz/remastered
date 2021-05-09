import React from "react";
import { LoaderContext } from "./LoaderContext";

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
  p: () => Promise<{ default: any }>
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
  component: () => Promise<{ default: any }>;
  initialState?: State;
  loadingElement?: React.ReactNode;
  contextKey?: string;
}): React.ReactElement {
  const ctx = React.useContext(DynamicImportComponentContext);
  const loaderCtx = React.useContext(LoaderContext);

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
        setState({ tag: "loaded", component: mod.default });
        if (props.contextKey) {
          ctx.set(props.contextKey, mod.default);
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
      // @ts-ignore
      return <state.component data={loaderCtx.get(props.contextKey)} />;
    }
  }
}
