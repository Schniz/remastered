---
title: Error Boundaries
description: Every app fails. Their ability to recover from them is what makes them great. Remastered allows you to recover from every error seamlessly as if it was expected.
---

Every app fails. Their ability to recover from them is what makes them great. Remastered allows you to recover from every error seamlessly as if it was expected.

Remastered leverages React error boundaries, and emulates them on the back-end, to allow you recover from errors in your app. How does that work?

Remastered exports a `ErrorBoundary` component that you can wrap any other component with. If the underlying component throws an error, the `ErrorBoundary` component will recover and show the `fallbackComponent` of your choice.

It's not just that. Every [route](./0_routing.md) can export an `ErrorBoundary` component which recovers it from throwing an error. When a `loader` is throwing, we will show the `ErrorBoundary` as well. The cool thing is that it works with nested components. You don't need to break your entire website because of a little error. The errors will be contained within your routes.

## Remastered's `ErrorBoundary` component

The `ErrorBoundary` component will pass the error being thrown from one of its (deeply nested) children to the `fallbackComponent` of your choice.

```tsx
import { ErrorBoundary } from 'remastered';

export default function MyComponent() {
  return (
    <div>
      <h1>My component!</h1>>
      <ErrorBoundary fallbackComponent={ErrorComponent}>
        <ComponentThatCanThrowAnError />
      </ErrorBoundary>
    </div>
  )
}

function ErrorComponent(props: { error: any }) {
  return <p>Oh no, I have an error: {String(props.error)}</p>
}
```

## Route `ErrorBoundary`

Every route can expose an `ErrorBoundary` component that will be rendered in case of a rendering error or a data-fetching error. When the errors happen in the back-end, they will be serialized to the client automatically.

**Keep in mind:** it's always better to obfuscate the errors. Doing otherwise is a big security risk.

_TODO_ consider if we want to remove the `stack` from the error. I am not sure about it because leaving the `message` is no better anyway. Errors should be whitelisted when they're sent to the client. This is a big problem in the design, but I don't think that there's a solution. Maybe that can be a default that can be overridden, or something that is based on the production/local environment.

```tsx
import React from "react";

export default function MyRoute() {
  throw "Hello, world!";
}

export function ErrorBoundary(props: { error: unknown }) {
  return <p>Oh no, I have an error: {String(props.error)}</p>;
}
```
