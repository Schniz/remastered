import React, { useContext } from "react";
import { NotFoundAndSkipRenderOnServerContext } from "./NotFoundAndSkipRenderOnServerContext";
import { useMatches } from "./useMatches";

export type EagerScriptTag = {
  id?: string;
  type?: string;
  contents?: string;
  src?: string;
};
export type ScriptPreload = {
  src: string;
};
export type ScriptTag =
  | ({ _tag: "eager" } & EagerScriptTag)
  | ({ _tag: "preload" } & ScriptPreload);
export const ScriptTagsContext = React.createContext<ScriptTag[]>([]);

/** A <script> tag... */
export type DevModeLinkTag = { src: string };
export type LinkTag = { rel: string; href: string };
export type AllLinkTags =
  | { _tag: "link"; link: LinkTag }
  | { _tag: "script"; script: DevModeLinkTag };

export const LinkTagsContext = React.createContext<AllLinkTags[]>([]);

export type MetaTags = Record<string, string | null>;

export function Scripts() {
  const scripts = React.useContext(ScriptTagsContext);

  return (
    <>
      {scripts.map((script, i) => {
        if (script._tag === "eager") {
          return (
            <script
              id={script.id}
              type={script.type}
              src={script.src}
              key={script.src ?? i}
              suppressHydrationWarning
              dangerouslySetInnerHTML={
                script.contents ? { __html: script.contents } : undefined
              }
            />
          );
        } else {
          return (
            <link
              suppressHydrationWarning
              key={"preload@" + script.src}
              rel="modulepreload"
              href={script.src}
            />
          );
        }
      })}
    </>
  );
}

export function Links() {
  const links = React.useContext(LinkTagsContext);

  return (
    <>
      {links.map((link) => {
        if (link._tag === "link") {
          return (
            <link
              rel={link.link.rel}
              href={link.link.href}
              key={link.link.href}
            />
          );
        } else {
          return (
            <script type="module" src={link.script.src} key={link.script.src} />
          );
        }
      })}
    </>
  );
}

const defaultMetaTags = {
  charSet: "UTF-8",
};

export function Meta() {
  const matches = useMatches();

  const metaTags: MetaTags = { ...defaultMetaTags };
  for (const match of matches) {
    if (match.meta) {
      try {
        Object.assign(metaTags, match.meta({ data: match.data }));
      } catch {}
    }
  }

  return (
    <>
      {Object.entries(metaTags).map(([key, value]) => {
        if (value === null) return null;

        if (key === "title") {
          return <title key={key}>{value}</title>;
        }

        if (key === "charSet") {
          return <meta charSet={value} key={key} />;
        }

        if (key.startsWith("og:")) {
          return <meta key={key} property={key} content={value} />;
        }

        return <meta key={key} name={key} content={value} />;
      })}
    </>
  );
}
