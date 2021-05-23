---
title: Routing
description: Routes and URLs go hand by hand in Remastered. And just like URLs, routes in Remastered are nested.
---

Routes and URLs go hand by hand in Remastered. And just like URLs, routes in Remastered are nested. Most websites share the same layout strategy: a master layout and a detailed page. Consider this very page: we have a top navigation bar, the side-panel which shows the list of documentation files to read, and the actual content.

Let's take GitHub for example. By accessing `https://github.com/Schniz/remastered` we can see that GitHub's layout is not very different:

- We have the "top bar", which is GitHub links and actions that relate to the current user
- We have a second "top bar", which is focused on the current repository
- Then we have a file list
- Then we have the README.md file of the current directory.

We can express that in React components like so:

```tsx
function RepoPage() {
  return (
    <FullPageLayout>
      <RepositoryLayout owner="Schniz" name="remastered">
        <TreeList>
          <MarkdownViewer for="README.md" />
        </TreeList>
      </RepositoryLayout>
    </FullPageLayout>
  );
}
```

This is exactly how we should be thinking about layouts in Remastered. Instead of building the React tree ourselves, Remastered is using React Router v6 to build it. In every layout, you can use the `<Outlet />` component to render the child components based on the URL the user has visited, with some rules:

```tsx
// app/routes/parent.jsx
export default function Parent() {
  return (
    <div>
      <h1>This is my title</h1>
      <Outlet />
    </div>
  );
}

// app/routes/parent/index.jsx
export default function Child() {
  return (
    <>
      <p>When visiting /parent</p>
      <p>I will be rendered in the Outlet!</p>
    </>
  );
}

// app/routes/parent/child.jsx
export default function Child() {
  return (
    <>
      <p>When visiting /parent/child</p>
      <p>I will be rendered in the Outlet!</p>
    </>
  );
}
```

And the rules are:

- Every `.jsx` and `.tsx` file under `app/routes/` is a route which follows the directory listing
- Nested layouts are in nested directories
- To un-nest layouts, use a dot `.` to create nesting, instead of `/`

| file                            | url               | component hierarchy                                      |
| ------------------------------- | ----------------- | -------------------------------------------------------- |
| `app/routes/index.tsx`          | `/`               | `index.tsx`                                              |
| `app/routes/about.tsx`          | `/about`          | `about.tsx`                                              |
| `app/routes/users.tsx`          | `/users`          | will be used as a nested layout, check `users/index.tsx` |
| `app/routes/users/index.tsx`    | `/users/`         | `users.tsx` > `users/index.tsx`                          |
| `app/routes/users/@id.tsx`      | `/users/:id`      | `users.tsx` > `users/@id.tsx`                            |
| `app/routes/users.register.tsx` | `/users/register` | `users.register.tsx`                                     |
