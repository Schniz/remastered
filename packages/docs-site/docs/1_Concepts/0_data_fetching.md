---
title: Data Fetching
---

Data fetching is not a special case in front-end applications. It's the core of our work. In Remastered, we've got you covered.

**tl;dr** — a magical experience which is driven by the `loader` function and the `useRouteData` hook.

### The `loader` function

Each [Route](./0_routing.md) can expose a `loader` function, which is essentially a server-side function that will be automatically loaded once the route is visited. It gets loaded on SSR so you get progressive enhancement for free, and it gets loaded semi-synchronously when navigating in an already-hydrated application.

The `loader` function _provides_ the data in the back-end, and the `useRouteData` can be used to _consume_ the loader data.

```tsx
import type { LoaderFn, useRouteData } from "remastered";

export const loader: LoaderFn<string> = async () => {
  return `Page was rendered at ${new Date()}`;
};

export default function MyPage() {
  const renderedAt = useRouteData<string>();

  return <div>{renderedAt}</div>;
}
```

Notice how easy it is to load the data. You visit the page, and synchronously get the values! No more `React.useEffect` or 3rd party packages that do magic. It's all baked into the framework.

### Smart Refetch

When navigating across routes, Remastered will understand what data is missing, and will refetch just the missing data.

If we have the following routes:

| path                 | loader                                   |
| -------------------- | ---------------------------------------- |
| `/`                  | no loader                                |
| `/users.tsx`         | loads the list of users                  |
| `/users/@userId.tsx` | loads the information of a specific user |

Then:

- navigating from `/users/1` to `/users/2` will only fetch the loader of `/users/@userId.tsx`
- navigating from `/` to `/users` will only fetch the loader of `/users.tsx`
- navigating from `/` to `/users/2` will fetch both `/users.tsx` and `/users/@userId.tsx` loaders

### Data is cached in the browser history

When navigating across routes, and then going "back" and "forward" in the browser, _no data will be refetched_. Users can simply go back/forward to see old data, just like old (and wonderful) server-side rendered applications. When the users will refresh, they will be served with fresh data again!
