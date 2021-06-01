---
title: Custom Entries
description: Remastered does not lock you to render your apps in a specific way. Need to do something prior to rendering? Or maybe track something while rendering or after that? You can always opt out from our defaults to add custom code and logic.
---

Remastered does not lock you to render your apps in a specific way. Need to do something prior to rendering? Or maybe track something while rendering or after that? You can always opt out from our defaults to add custom code and logic.

## Overriding the server entry

A server entry is a simple function that turns a `Request` into a `Response`. The function also gets more stuff that are needed for Remastered to render your app correctly, such as the rendered components, the data that was loaded by the `loader`s, etc.

These files should be in the following paths:

- `app/entry.server.tsx`
- `app/entry.server.ts`
- `app/entry.server.jsx`
- `app/entry.server.js`

The type signature for the server entry is exported under the name `RenderServerEntryFn`. Here is the default implementation:

```tsx
export default async function renderServer(
  opts: RenderServerEntryOptions
): Promise<Response> {
  // We render our React component into a string
  const string = ReactDOMServer.renderToString(
    // opts.Component is the Remastered app!
    <opts.Component ctx={opts.ctx} requestedUrl={opts.request.url} />
  );

  // Return an HTTP response based on the value.
  // You can see we also add doctype, which is not available to do
  // in plain JSX.
  return new Response(`<!DOCTYPE html>` + string, {
    status: opts.httpStatus,
    headers: {
      // Content-Type is important!
      "Content-Type": "text/html",
      ...Object.fromEntries(opts.httpHeaders.entries()),
    },
  });
}
```

## Overriding the client entry

A server entry is a function to hydrate your application. When we say "is a function to hydrate your application", we literally mean it because the default implementation calls `ReactDOM.hydrate` and that's it. Maybe you want to do more stuff before hydrating or after that. It's all good! This is what this is for. These files should be in the following paths:

- `app/entry.client.tsx`
- `app/entry.client.ts`
- `app/entry.client.jsx`
- `app/entry.client.js`

The type signature for the server entry is exported under the name `RenderClientEntryFn`. Here is the default implementation:

```tsx
export default async function defaultClientEntry(
  opts: RenderClientEntryOptions
) {
  ReactDOM.hydrate(
    <React.StrictMode>
      <opts.Component />
    </React.StrictMode>,
    document
  );
}
```
