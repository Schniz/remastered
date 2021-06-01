---
title: Differences from Create-React-App
link_title: "from Create-React-App"
description: Compare Remastered and Create-React-App, the "de-facto" starting point for creating React applications. CRA is supported by Facebook and the React team itself, but it has some drawbacks.
---

Create-React-App, or _CRA_, is the "de-facto" starting point for creating React applications. It is supported by Facebook and the React team itself, but it has some drawbacks.

_CRA_ is meant for a single entrypoint, and to be deployed at a static server. It means that if you have a big website with multiple routes, you will find yourself sending your entire front-end application to the client. In Remastered, every route has its own JS chunk, which will be downloaded when the user visits it. No more overfetching and slow mobile experiences!

_CRA_ does not support file-system routing and does not have a built-in router, which is an integral part of any website and system. This means, that in every new project, you will have to choose and implement a routing solution. It is also the reason some some modern don't store the state and routes in the URL, making sharing links harder — creating a correlation between modern apps and bad sharing experience. In Remastered, the router is deeply integrated. URLs are not an afterthought. File-system routing is applied to allow you prototype your app as fast as you can!

Since _CRA_ is meant to be statically hosted after build-time, it does not have any notion of data-fetching nor an API endpoint. Therefore, _CRA_ suggests that the front-end team should be separate from the back-end team and will eventually _make shipping harder_. Remastered can be used both ways, but when starting a fresh project, one developer can own the entire stack -- both the front-end AND the back-end, without sacrificing developer experience and user experience.

_CRA_ is using Webpack, a widely used JS bundler. It also uses Babel to transform modern JS and TypeScript into JS code that current browsers can use. In development, _CRA_ will bundle your app so you can work on it locally, with HMR enabled. Bundling your app in development means that Webpack will have to bundle your _entire_ application, making the boot-time very slow and will get slower as your application gets larger. with Remastered, on the other hand, is using [Vite] and [esbuild] to serve, bundle and transform your codebase. In development, Vite acts as an ES-module server and does not bundle your app at all in development, which makes development snappy and fast no matter what size is your app.

|                           | Remastered                                                                                   | Next.js                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Development server        | :white_check_mark: Vite (& esbuild) which provides HMR that stays fast no matter on app size | :warning: Webpack, which can get slower as app becomes bigger in code size       |
| Production build          | :white_check_mark: Vite (& rollup)                                                           | :white_check_mark: Webpack 5                                                     |
| File-system routing       | :white_check_mark:                                                                           | :x:                                                                              |
| Router                    | :white_check_mark: [React Router], the de-facto standard router for React apps               | :x: No routing solution, bring-your-own-router                                   |
| Nested routes             | :white_check_mark: Best for accessibility                                                    | :x:                                                                              |
| Co-located API endpoints  | :white_check_mark: Actions are implemented to co-locate mutation endpoints                   | :x: No back-end function at all, you must develop an external API                |
| Hassle-free data fetching | :white_check_mark: Loaders are implemented to co-locate data fetching                        | :x: CRA forces you to use `useEffect` and build your own data-fetching mechanism |
| Multiple entrypoints      | :white_check_mark:                                                                           | :x:                                                                              |

[vite]: https://vitejs.dev
[esbuild]: https://esbuild.github.io/
