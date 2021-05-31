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
  LoaderFn,
  useRouteData,
} from "remastered";
import remasteredPkg from "remastered/package.json";
import "tailwindcss/tailwind.css";

type Data = {
  generationTimestamp: number;
};

export const loader: LoaderFn<Data> = async () => {
  return {
    generationTimestamp: Date.now(),
  };
};

export default function Layout() {
  const routeData = useRouteData<Data>();
  const date = React.useMemo(() => {
    return new Date(routeData.generationTimestamp);
  }, [routeData.generationTimestamp]);

  return (
    <html>
      <head>
        <Meta />
        <Favicons />
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
          <div className="pt-10 pb-2 text-sm text-center text-black text-opacity-50">
            <p>
              This page was generated with Remastered v{remasteredPkg.version}{" "}
              at{" "}
              <time
                dateTime={date.toISOString()}
                title={date.toISOString()}
                suppressHydrationWarning
              >
                {date.toLocaleString(["en-US"])}
              </time>
            </p>
          </div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}

if (import.meta.hot) {
  import.meta.hot!.accept();
}

export const meta: MetaFn<unknown> = () => {
  return {
    title: `Remastered`,
    description: `Remastered: a full-stack approach to React development.`,
    viewport: "width=device-width, initial-scale=1",
    generator: `Remastered v${remasteredPkg.version}`,
  };
};

export const headers: HeadersFn = () => {
  return {
    "X-Framework": `Remastered v${remasteredPkg.version}`,
  };
};

function Favicons() {
  return (
    <>
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
    </>
  );
}
