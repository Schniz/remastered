import React from "react";

export type ScriptTag = {
  id?: string;
  type?: string;
  contents?: string;
  src?: string;
};
export const ScriptTagsContext = React.createContext<ScriptTag[]>([]);

export type LinkTag = { rel: string; href: string };
export const LinkTagsContext = React.createContext<LinkTag[]>([]);

export function Scripts() {
  const scripts = React.useContext(ScriptTagsContext);

  return (
    <>
      {scripts.map((script, i) => {
        return (
          <script
            data-remastered
            id={script.id}
            type={script.type}
            src={script.src}
            key={script.src ?? i}
            suppressHydrationWarning={true}
            dangerouslySetInnerHTML={
              script.contents ? { __html: script.contents } : undefined
            }
          />
        );
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
