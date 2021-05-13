# Remastered

A proof of concept for an open source implementation of Remix.

## Why?

Remix looks like a really fine product. Michael and Ryan do a great job for the React community and I believe their thought should be pushed forward. Some companies and individuals won't embrace Remix because it is closed source — many devs want an open stack they can own.

## How?

By leveraging Vite, a super fast bundler with HMR and lots of convention over configuration.

## What's implemented?

### SSR

Every route is SSR'd completely, including the data.

### Nested routing

Every `tsx` or `jsx` file in `./app/routes/` will become a route.
All routes are chunked so you only download the routes you are visiting.
SSR will make sure you preload the routes you are currently looking at and enforce downloading it before hydration.

| file                          | url             | component hierarchy                                    |
| ----------------------------- | --------------- | ------------------------------------------------------ |
| app/routes/index.tsx          | /               | index.tsx                                              |
| app/routes/about.tsx          | /about          | about.tsx                                              |
| app/routes/users.tsx          | /users          | ⚠ will be used as a container, check `users/index.tsx` |
| app/routes/users/@id.tsx      | /users/:id      | `users.tsx` > `users/@id.tsx`                          |
| app/routes/users/index.tsx    | /users/         | `users.tsx` > `users/index.tsx`                        |
| app/routes/users.register.tsx | /users/register | `users.register.tsx`                                   |

> 📝 Note: Use `@` to declare a parameter.
>
> Shells will interpret `$id` as the ENV var `id`. `@` is safer for this. We might support it both ways.
>
> `rm "app/routes/users/$id.tsx"` is parsed differently from `rm 'app/routes/users/$id.tsx'`. I don't like this.

### Loaders

Every route file can export an async `loader` function and its data will be available using `useRouteData()`, synchronously.

```ts
export async function loader() {
  return { hello: "world" };
}

export default function MyComponent() {
  const { hello } = useRouteData();
  return <div>Hello, {hello}</div>;
}
```

### Actions

Every route can export an async function `action`, which will catch the HTTP requests that are not `GET`.
Actions are a simple Request => Response handlers. It's all up to you how to handle them, but we provide simple utilities to construct the responses yourself.

```ts
export const action: ActionFn = async ({ req }) => {
  const formData = new URLSearchParams(await req.text());
  const username = formData.get("username");
  if (!username) {
    return redirectTo(`/users/new`);
  }
  await database.createUser(username);
  return redirectTo(`/users/${username}`);
};
```
