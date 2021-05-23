---
title: Vercel
description: Learn how to deploy Remastered apps to Vercel!
---

Deployment to Vercel has first-class support using the `@remastered/vercel` package.

## Set up Vercel as a deploy target

Start with installing the `@remastered/vercel` package:

```bash
$ npm install @remastered/vercel
# or
$ yarn add @remastered/vercel
```

Then, run the `setup` command:

```bash
$ npx remastered-vercel setup
```

The setup script will add and edit the following files:

- `package.json` will get a new `vercel-build` script, which will build your Remastered project and call the `postbuild` hook of `remastered-vercel`. The `postbuild` hook prepares the static routes and the public assets to be served from Vercel edge network.
- `api/remastered-serverless.js` will be created, which is a serverless function that renders every screen in your app.
- `vercel.json` will be created or modified, adding the routing for `api/remastered-serverless.js` along with the static files it needs to copy into the serverless function build.

After that, you can use Vercel's deployment previews and Git hooks to deploy your website. Easy!

## Static Page Generation

_TODO: consider if this should be a standard feature of Remastered and not just for the Vercel plugin_

Some pages can be generated in build time. Look at this documentation site, for instance. Most of the data here is based on Markdown files, that can only change on new deployments.

Thankfully, `@remastered/vercel` supports generating static content in build time. To do that, create a new file under `config/vercel.ts`:

```ts
import type { GetStaticPathsFn } from "@remastered/vercel";

export const getStaticPaths: GetStaticPathsFn = async () => {
  return [];
};
```

Every element in the array would be a path we will generate static content for. You can import your app logic to generate the list dynamically:

```ts
import type { GetStaticPathsFn } from "@remastered/vercel";
import { getAllDocs } from "../app/getAllDocs";

export const getStaticPaths: GetStaticPathsFn = async () => {
  const allDocs = await getAllDocs();
  return allDocs.map((doc) => doc.absoluteUrl);
};
```

Now, when `remastered-vercel postbuild` will be called, the static content will be ready for Remastered to pick up in Vercel, allowing you to have awesome performance in Vercel.

### Tips and Tricks

#### Use headers to cache responses

_TODO_
