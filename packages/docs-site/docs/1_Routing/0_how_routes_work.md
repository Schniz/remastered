---
title: Nested Routes
---

Just like URLs, routes in Remastered are nested. Most websites share the same layout strategy: a master layout and a detailed page. Consider this very page: we have a top navigation bar, the side-panel which shows the list of documentation files to read, and the actual content.

Let's take GitHub for example. By accessing https://github.com/Schniz/remastered we can see that GitHub's layout is not very different:

- We have the "top bar", which is GitHub links and actions that relate to the current user
- We have a second "top bar", which is focused on the current repository
- Then we have a file list
- Then we have the README.md file of the current directory.

We can express that in React components like so:

```typescript
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

This view
