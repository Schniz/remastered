---
title: Data Mutations
description: Data mutations in Remastered works like old-school HTML forms, but progressively enhanced. This makes your code work everywhere, every time, allowing your to develop great experience.
---

Back in the good old days, the web main method of applying data mutations was forms. Back-end centered frameworks like [Rails] and [Laravel] are still focused around web forms, but the JavaScript ecosystem does not leverage this. Why do we ignore forms? What's easier than a `<form />`? Most of the hatred comes from a poor user experience and accessibility issues.

Remastered solves data mutations using progressively enhanced forms. When rendered by the server, we use plain old `<form />` tags. Then, when JavaScript kicks in, we allow having more complex interactions with the form -- just like the `<Link />` tag for URL navigation.

Data mutations is split in two: back-end and front-end.

## Back-end

The back-end part of the data mutations is a special function exported from a route, which is called `action`. This function gets a `Request` and returns a `Response`. It will be triggered when the route will receive a request that isn't `GET`, so e.g. `POST, PUT, DELETE`:

```tsx
// app/routes/my-route.tsx

import { redirectTo, ActionFn } from "remastered";

export const action: ActionFn = async ({ request }) => {
  console.log("Do something with the request?");
  request.method; // POST, PUT, DELETE...

  const data = new URLSearchParams(await request.text());
  console.log(data.get("message"));

  return redirectTo("/");
};

// ...rest of app...
```

In your action you can use [sessions](./2_sessions.md) to authenticate users and add error flashes.

> Note: it's very likely that most of your actions will return a redirect response, like redirecting to a new item that was created in database, or back to the form page, etc.

## Front-end

When using `action` functions, you can use a plain old `form`. This will work without any JavaScript enabled. :wink:

If you want to have a more complex interaction, like the following -- you can use the `useForm` hook to get a dynamic behavior:

- Focus handling
- Multiple parallel submits
- Optimistic UI

The `useForm` is a React hook that returns multiple values back:

- a `Form` component
- `pendingSubmits`

```tsx
import { useForm } from "remastered";

function MyComponent() {
  const [Form, pendingSubmits] = useForm();

  return (
    <Form method="post" action="/">
      <input type="text" name="message" />
      <button type="submit">Submit</button>
    </Form>
  );
}
```

The `Form` component, which is a small bounded wrapper around `form` that hooks into `onSubmit` that submits the value. This is a drop-in replacement for the `<form />` component -- replace the `form` with a capitalized `Form` and that's it -- you have a JavaScript-enabled form.

Working with it is almost the same as you would use a `form` tag. They work the same way to allow the back-end to be agnostic.

When the form submits, it will add an entry to the `pendingSubmits` array -- which tracks the "in-flight" requests, and can be used for optimistic UI and focus management.

Each `PendingSubmit` is an object with:

- `method`: the form method
- `action`: the form action
- `encType`: the form encoding type (the `Content-Type` being sent to the server). _note: the default content type is `application/x-www-urlencoded`. If you want to upload files, set the `encType` of the `Form` to `form-data/multipart`_
- `data`: a [`FormData`] instance contains the data that is being sent to the server. _note: highly valuable for optimistic ui!_

#### Optimistic UI

You can use the `data` key to provide optimistic UI:

```tsx
import { getTweets, Tweet } from "~app/model/Tweet";
import { useForm, useRouteData, LoaderFn } from "remastered";

export const loader: LoaderFn<Tweet[]> = async () => {
  return getTweets();
};

export default function AllTweets() {
  const storedTweets = useRouteData();
  const [Form, pendingSubmits] = useForm();

  const pendingTweets = pendingSubmits.map((submit): Tweet => {
    return {
      text: submit.data.get("text")!,
      username: submit.data.get("username")!,
    };
  });

  const allTweets = [...pendingTweets, ...storedTweets];

  return (
    <>
      <Form>...</Form>
      <ul>
        {allTweets.map(tweet => ...)}
      </ul>
    </>
  );
}
```

[laravel]: https://laravel.com
[rails]: https://rubyonrails.org
[`formdata`]: https://developer.mozilla.org/en-US/docs/Web/API/FormData
