import React from "react";

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

export type LinkTag = { rel: string; href: string };
export const LinkTagsContext = React.createContext<LinkTag[]>([]);

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
        return <link rel={link.rel} href={link.href} key={link.href} />;
      })}
    </>
  );
}
