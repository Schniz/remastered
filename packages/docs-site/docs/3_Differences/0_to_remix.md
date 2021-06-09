---
title: Differences from Remix
link_title: "from Remix"
description: Compare Remastered and Remix, a fairly new paid and closed-source full-stack framework from the creators of React Router.
---

Remastered is _heavily_ influenced by Remix. Differences in concepts will be very small. The big differences are in source code availablity and practical implementation.

Remix is a paid closed-source project, while Remastered is an MIT-licensed open source project you can use anytime, anywhere. It takes the whole "own your stack" philosophy to the next level. Don't want to spend some bucks, but still want to try using these awesome concepts? Be our guest. Want to maintain your own fork of Remastered? be our guest. Want to contribute back all the knowledge you have accumulated over the time you used the product? We'll be more than happy to accept PRs that take the project forward.

Remix is using their own bundling offering based on [esbuild] to get great performance. Remastered is also using [esbuild] but it using it through [Vite].

Remix has a live-reload component/hook that will listen to file changes and trigger a hard refresh on every save. Remastered is using [Vite]'s amazing HMR capabilities to do HMR for both front-end code and back-end code, so the application state will be preserved, allowing you great developer experience.

## Some very technical differences

Remastered does no guarantee 100% compatibility with Remix. It's not a goal. It's more about sharing concepts and ideas.

- Remix is using `$` prefixes in file-system routing. I find this a problem in experience because `ls app/routes/$user.tsx` is not the same as `ls 'app/routes/$user.tsx'`, so Remastered is using `@` to determine a dynamic component in the URL.
- Remix uses `.` for nesting URLs without nesting layouts. Dots are important for URLs! They are used for extensions. What if you want to generate a `.xml` file? Or `.png` file? Do you need to avoid using the file-system routing? This is why Remastered is using tilde `~` instead.
- Remix has no special care for CSS imports. In Remastered, CSS imports are simply `import './file.css'`. CSS modules also work the same way.
- Remastered Vercel deploy target can export static pages for better performance. This is opt-in behavior.

[esbuild]: https://esbuild.github.io/
[vite]: https://vitejs.dev
