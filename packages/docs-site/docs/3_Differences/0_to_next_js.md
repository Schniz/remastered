---
title: Differences from Next.js
link_title: "from Next.js"
---

Next.js is a wonderful front-end framework, build by Vercel, which is meant to be deployed at the Vercel cloud. Although supporting SSR out-of-the-box, Next.js is mainly a front-end framework, and as such, it does not suggest using `<form>`, and HTTP headers are an afterthought. Remastered knows how your app is built. So it provides a friction-free data fetching, nested routes for better accessibility and fast prototyping, co-located API endpoints which can be used with a simple `<form>` tag.

Next.js' router is a custom router, which does not support nested routes. Remastered is using [React Router], the de-facto standard router for React apps, which supports nested routes, nested layouts, relative links and more advanced features.

Both Next.js and Remastered share the concept of file-system routing. In Remastered, layouts are also nested based on the directory structure, to allow standard onion-layout applications.

Next.js forces you to render the React component every time. In Remastered, you're in full control. If you want to return a redirect, a JSON response a binary file or even a hardcoded HTML string, you are allowed to do so! All you have to do is to return a `Response` from your `loader` function.

Next.js does not come with a built-in support for user sessions. Remastered comes baked with a session solution, since every full-stack app will eventually have some kind of sessions. Remastered also has an open API for adding a custom session storage, so you can store it practically everywhere: from the browser cookies to Redis, through S3 or in-memory or file-system.

Next.js does not allow you to opt-out from JavaScript for specific pages (or your entire application). In Remastered, it is as easy as removing `<Scripts />` from your layout component.

Next.js comes with `styled-jsx` as a default CSS in JS solution. Remastered supports global CSS and CSS modules out of the box (by leveraging Vite). This means that integrating [tailwindcss] is as easy as `import 'tailwindcss/tailwind.css'`.

|                           | Remastered                                                                                   | Next.js                                                                         |
| ------------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Development server        | :white_check_mark: Vite (& esbuild) which provides HMR that stays fast no matter on app size | :warning: Webpack, which can get slower as app becomes bigger in code size      |
| Production build          | :white_check_mark: Vite (& rollup)                                                           | :white_check_mark: Webpack 5                                                    |
| File-system routing       | :white_check_mark:                                                                           | :white_check_mark:                                                              |
| Router                    | :white_check_mark: [React Router], the de-facto standard router for React apps               | :warning: Custom router                                                         |
| Nested routes             | :white_check_mark: Best for accessibility                                                    | :x: No nested routing                                                           |
| Co-located API endpoints  | :white_check_mark: Actions are implemented to co-locate mutation endpoints                   | :x: Next.js advises on having a separate `/api` routes                          |
| Hassle-free data fetching | :white_check_mark: Loaders are implemented to co-locate data fetching                        | :x: Next.js forces you use `useEffect` to build your own data-fetching solution |
| Multiple entrypoints      | :white_check_mark:                                                                           | :white_check_mark:                                                              |

- Some of the comparison items here are based on [Sergio Xalambrí's Remix vs Next.js Comparison blog post](https://sergiodxa.com/articles/remix-vs-next-js-comparison)

[react router]: https://github.com/reacttraining/react-router
[tailwindcss]: https://tailwindcss.com
