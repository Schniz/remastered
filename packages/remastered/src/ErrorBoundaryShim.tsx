import React from "react";
import {
  create as createRenderer,
  ReactTestRendererJSON,
} from "react-test-renderer";

/**
 * An error boundary shim for SSR.
 *
 * This is obviously not supported in React DOM, but it does not mean we should
 * not have it in our rendering phase!
 *
 * So how can we capture errors in our render tree?
 *
 * Sadly, we can't just `try {} catch {}` around our component. This is
 * because React does not render eagerly all the sub-components. When
 * the following component is rendererd: `<div><A /></div>`, React
 * returns something similar to `{ div: [A] }`. So if we want to wrap
 * in `try/catch` we will have to wrap every single component in the tree.
 * This is not nice. Possible, but not nice.
 *
 * Since we're only gonna use this shim in the backend, we can use another renderer.
 * First I thought about rendering the entire subtree into a string. But then
 * I realized that in order to return a valid React component, I will have to parse
 * the HTML back into a JSON. Then I remembered -- this is exactly how the React test renderer works.
 *
 * So we render a JSON tree from the children passed to the `ErrorBoundaryShim` element.
 * If we have an error,
 *
 * Maybe that's bad, maybe it's not performant, but it works.
 * We can make it faster later on!
 */
export function ErrorBoundaryShim(
  props: ErrorBoundaryShimProps
): React.ReactElement | null {
  try {
    const renderer = createRenderer(withAllContexts(props.children));
    const markup = renderer.toJSON();
    return convertTestRendererJsonToReactElement(markup);
  } catch (error) {
    return <props.fallbackComponent error={error} />;
  }
}

export type ErrorBoundaryShimProps = {
  children: React.ReactElement;
  fallbackComponent: React.ComponentType<{ error: any }>;
};

let g: {
  $$remasteredContextMap?: Set<WeakRef<React.Context<any>>>;
} = {};

if (typeof global !== "undefined") {
  g = global as any;
}

function getAllContexts(): React.Context<any>[] {
  const contexts: React.Context<any>[] = [];

  for (const ref of [...g.$$remasteredContextMap!]) {
    const context = ref.deref();
    if (!context) {
      g.$$remasteredContextMap!.delete(ref);
    } else {
      contexts.push(context);
    }
  }

  return contexts;
}

/**
 * We need to pass all the contexts to the new React element tree we're
 * constructing in our partial rendering here.
 *
 * We use the shimmed context set to go over all of the created contexts
 * and we pass them explicitly, one by one, to our renderer.
 *
 * This is breaking the rules of hooks,
 * but we're living on the edge here, fellas.
 */
function withAllContexts(child: React.ReactElement): React.ReactElement {
  const wrappedInContexts = getAllContexts()
    .map((ctx) => {
      return [ctx.Provider, React.useContext(ctx)] as const;
    })
    .reduce((innerValue, [Provider, value]) => {
      return <Provider value={value}>{innerValue}</Provider>;
    }, child);
  return wrappedInContexts;
}

/**
 * Simply converts a result of `react-test-renderer` into a React.ReactElement
 */
function convertTestRendererJsonToReactElement(
  output: ReactTestRendererJSON | ReactTestRendererJSON[] | null
): React.ReactElement | null {
  if (!output) return null;
  const jsons = Array.isArray(output) ? output : [output];
  const elements: React.ReactElement[] = [];

  for (const json of jsons) {
    const children = json.children?.map((child) =>
      typeof child === "string"
        ? child
        : convertTestRendererJsonToReactElement(child)
    );
    const element = React.createElement(json.type, json.props, children);
    elements.push(element);
  }

  if (elements.length === 0) {
    return null;
  } else if (elements.length === 1) {
    return elements[0];
  } else {
    return React.createElement(React.Fragment, {}, elements);
  }
}
