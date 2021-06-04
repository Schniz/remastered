import React from "react";
import $ from "cheerio";
import { renderToStaticMarkup } from "react-dom/server";

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
 * Unfortunately, the React test renderer didn't worked out because it failed to have nested error boundaries.
 * So I used Cheerio to parse HTML. Maybe there's something faster! I really wish we had a fast HTML parser
 * that had `span`s like we have in JS parsers: then we can just use the containing HTMLs and remove them from the original string. bah.
 *
 * Maybe that's bad, maybe it's not performant, but it works.
 * We can make it faster later on!
 */
export function ErrorBoundaryShim(
  props: ErrorBoundaryShimProps
): React.ReactElement | null {
  try {
    const html = renderToStaticMarkup(withAllContexts(props.children));
    return convertHtmlToReactElements(html);
  } catch (error) {
    return <props.fallbackComponent error={error} />;
  }
}

function convertHtmlToReactElements(html: string): React.ReactElement {
  const $$ = $.load(html, { xmlMode: true });
  const elements: React.ReactNode[] = [];

  for (const node of $$.root().children()) {
    const attributes: Record<string, unknown> = {
      ...node.attribs,
      key: elements.length,
    };
    const children = $$(node).children;
    let text: string | undefined = undefined;

    if (children.length === 0) {
      text = $$(node).text();
    } else {
      attributes.dangerouslySetInnerHTML = { __html: $$(node).html() };
    }

    elements.push(React.createElement(node.name, attributes, text));
  }

  return React.createElement(React.Fragment, {}, elements);
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
