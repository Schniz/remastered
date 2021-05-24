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
import { MenuIcon, XIcon } from "@heroicons/react/solid";
import cx from "classnames";

export const loader: LoaderFn<FileEntry[]> = async () => {
  return docList();
};

export default function DocsLayout() {
  const files = useRouteData<FileEntry[]>();
  const { MenuButton, isMenuOpen } = useMenuButton();
  const directoryListingRef = React.useRef<HTMLDivElement>(null);

  React.useLayoutEffect(() => {
    if (!directoryListingRef.current) {
      return;
    }

    if (isMenuOpen) {
      directoryListingRef.current.focus();
    }
  }, [isMenuOpen]);

  return (
    <div className="flex-1 w-full mx-auto md:flex max-w-screen-lg">
      <div className="w-screen md:w-auto">
        <div
          tabIndex={0}
          ref={directoryListingRef}
          className={cx(
            "p-2 pt-4 pr-8 bg-white bg-opacity-80 z-10 backdrop-filter backdrop-blur-sm",
            "fixed bottom-0 w-screen",
            "md:static md:w-72 md:pt-6 md:block",
            {
              block: isMenuOpen,
              hidden: !isMenuOpen,
            }
          )}
        >
          <DirectoryListing paths={files} />
        </div>
        <MenuButton />
      </div>
      <div className="flex-row flex-1 pb-10 overflow-scroll box-border md:pb-0">
        <Outlet />
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
              tabIndex={0}
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
                tabIndex={0}
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
    description: `The documentation for Remastered, the real full-stack approach to React development.`,
  };
};

function useMenuButton(): {
  MenuButton: React.ComponentType;
  toggleMenu(): void;
  isMenuOpen: boolean;
} {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const toggleMenu = React.useCallback(() => {
    setIsMenuOpen((v) => !v);
  }, [setIsMenuOpen]);
  const MenuButtonIcon = isMenuOpen ? XIcon : MenuIcon;

  const output = React.useMemo(() => {
    const MenuButton: React.FunctionComponent = () => {
      return (
        <button
          aria-label="Toggle menu"
          className="fixed bottom-0 right-0 z-50 block p-2 bg-white rounded-full bg-opacity-75 md:hidden"
          onClick={toggleMenu}
        >
          <MenuButtonIcon className="w-8 h-8" />
        </button>
      );
    };

    return { MenuButton, toggleMenu, isMenuOpen };
  }, [toggleMenu, MenuButtonIcon, isMenuOpen]);

  return output;
}
