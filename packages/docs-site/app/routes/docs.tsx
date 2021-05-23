/// <reference types="vite/client" />

import { ExternalLinkIcon } from "@heroicons/react/outline";
import React from "react";
import {
  Link,
  LoaderFn,
  MetaFn,
  NavLink,
  Outlet,
  useRouteData,
} from "remastered";
import _ from "lodash";
import { docList, FileEntry } from "../docList";

export const loader: LoaderFn<FileEntry[]> = async () => {
  return docList();
};

export default function DocsLayout() {
  const files = useRouteData<FileEntry[]>();

  return (
    <div className="flex flex-col w-screen h-screen">
      <div className="p-2 px-4 text-white bg-black shadow-sm">
        <div className="flex max-w-5xl mx-auto">
          <Link className="font-bold" to="/">
            Remastered
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
      <div className="flex-1 mx-auto md:flex max-w-min">
        <div className="p-2 pt-6 pr-8 md:w-72">
          <DirectoryListing paths={files} />
        </div>
        <div className="flex-1 w-full box-border">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

function DirectoryListing({ paths }: { paths: FileEntry[] }) {
  return (
    <>
      {paths.map((path) => {
        if (path.type === "file") {
          return (
            <NavLink
              key={path.link}
              to={path.link}
              className="block py-1 hover:underline hover:text-red-700 transition-all duration-75"
              activeClassName="font-bold"
            >
              {path.title}
            </NavLink>
          );
        } else {
          return (
            <React.Fragment key={path.title}>
              <div
                key={path.title}
                className="pt-4 text-sm font-bold text-black text-opacity-75 first:pt-0"
              >
                {path.title}
              </div>
              {path.children.length && (
                <div className="pl-2">
                  <DirectoryListing paths={path.children} />
                </div>
              )}
            </React.Fragment>
          );
        }
      })}
    </>
  );
}

export const meta: MetaFn<unknown> = () => {
  return {
    viewport: "width=device-width, initial-scale=1",
    description: `The documentation for Remastered, the real full-stack approach to React development.`,
  };
};
