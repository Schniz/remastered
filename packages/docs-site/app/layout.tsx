import { ExternalLinkIcon } from "@heroicons/react/outline";
import React from "react";
import {
  Meta,
  Scripts,
  Links,
  Outlet,
  MetaFn,
  HeadersFn,
  Link,
} from "remastered";
import remasteredPkg from "remastered/package.json";
import "tailwindcss/tailwind.css";

export default function Layout() {
  return (
    <html>
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="flex flex-col w-screen h-screen">
          <div className="p-2 px-4 text-white bg-black shadow-sm">
            <div className="flex max-w-5xl mx-auto">
              <Link className="flex items-center font-bold" to="/">
                <span aria-hidden className="block pr-1">
                  🎚
                </span>
                <span>Remastered</span>
              </Link>
              <div className="flex-1" />
              <a
                href="https://github.com/Schniz/remastered"
                target="_blank"
                rel="noopener noreferer"
                className="flex items-center justify-center text-white hover:text-pink-100 transition-all text-opacity-90"
              >
                GitHub
                <ExternalLinkIcon className="w-4 h-4 opacity-75" />
              </a>
            </div>
          </div>
          <Outlet />
        </div>
        <Scripts />
      </body>
    </html>
  );
}

export const meta: MetaFn<unknown> = () => {
  return {
    title: `Remastered v${remasteredPkg.version}`,
    description: `Remastered: a full-stack approach to React development.`,
  };
};

export const headers: HeadersFn = () => {
  return {
    "X-Framework": `Remastered v${remasteredPkg.version}`,
  };
};
