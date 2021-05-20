---
title: Getting Started
---

Remastered is a set of libraries in npm. Let's start by creating a new project:

```sh
$ mkdir my-project
$ cd my-project
$ npm init -y
```

Now when we have our project, we can set up Remastered:

```sh
$ npm install remastered
```

Now, create your home route in: `app/routes/index.jsx`

```js
import React from "react";

export default function Home() {
  return <div>Welcome to Remastered</div>;
}
```

Now we can run the following command to launch a dev session:

```sh
$ remastered dev
```

Open the browser in `http://localhost:3000` and witness, your new route!

## Adding loaders

Let's say we want to show Schniz's GitHub repositories. This can be done by making an HTTP request to `https://api.github.com/users/Schniz/repos`. In order to do that, we can reopen our `app/routes/index.jsx` file, and add a `loader` function.

The `loader` function is an async function that whatever you return from it will be available through the `useRouteData` hook:

```js
import React from "react";
import { useRouteData } from "remastered";

export async function loader() {
  const response = await fetch("https://api.github.com/users/Schniz/repos");
  const json = await response.json();
  return json.map((x) => x.full_name); // array of strings, ["Schniz/fnm", "Schniz/cmd-ts", ...]
}

export default function Home() {
  const names = useRouteData();
  return (
    <>
      <h1>Schniz's repositories:</h1>
      <ul>
        {names.map((name) => {
          return <li key={name}>{name}</li>;
        })}
      </ul>
    </>
  );
}
```

Open your browser again. You can immediately see the list of repositories. Magic!

## Route parameters

Our app can only show Schniz's repositories. This is not nice. What if we want to have it parameterized?

Let's create a file in `app/routes/@username.jsx`. See that small `@`? This means `username` is a parameter. If you know Express or Sinatra, this is the same as having a `/:username` route. We can use this parameter in the `loader` function:

```js
import React from "react";
import { useRouteData } from "remastered";

export async function loader({ params }) {
  const response = await fetch(
    `https://api.github.com/users/${params.username}/repos`
  );
  const json = await response.json();
  return {
    repos: json.map((x) => x.full_name), // array of strings, ["Schniz/fnm", "Schniz/cmd-ts", ...]
    username: params.username,
  };
}

export default function UserRepos() {
  const { username, repos } = useRouteData();
  return (
    <>
      <h1>{username}'s repositories:</h1>
      <ul>
        {repos.map((name) => {
          return <li key={name}>{name}</li>;
        })}
      </ul>
    </>
  );
}
```

Now if we visit http://localhost:3000/Schniz we will see Schniz's repos. If we will visit https://localhost:3000/jordwalke we will see Jordan Walke's repositories!
