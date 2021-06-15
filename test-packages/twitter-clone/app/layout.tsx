import React from "react";
import { Scripts, Links, Meta, Outlet, LinksFn, HeadersFn } from "remastered";
import { getSession } from "./session";

export const links: LinksFn = () => {
  return [
    {
      rel: "stylesheet",
      href: "https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css",
    },
  ];
};

export const headers: HeadersFn = async ({ request }) => {
  const session = await getSession(request);
  return {
    "Set-Cookie": await session.commit(),
  };
};

export default function Layout() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
