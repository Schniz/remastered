// copied mostly from https://github.com/substack/catch-links/blob/master/index.js
// but altered to remove event listeners

import React from "react";

function catchLinks(
  element: HTMLElement,
  callback: (url: URL) => unknown
): () => void {
  const handler = (ev: MouseEvent) => {
    if (
      ev.altKey ||
      ev.ctrlKey ||
      ev.metaKey ||
      ev.shiftKey ||
      ev.defaultPrevented
    ) {
      return;
    }

    const anchor = (ev.target as Element).closest("a");
    if (!anchor) return;

    const href = anchor.getAttribute("href");
    if (!href) return;

    const u = new URL(href, window.location.href);

    if (u.host && u.host !== location.host) return true;

    ev.preventDefault();

    callback(u);
  };

  element.addEventListener("click", handler);
  return () => element.removeEventListener("click", handler);
}

export function useCatchLinks(
  element: React.RefObject<HTMLElement>,
  callback: (url: URL) => unknown
): void {
  const callbackRef = React.useRef(callback);

  React.useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  React.useEffect(() => {
    if (!element.current) return;
    return catchLinks(element.current, (u) => callbackRef.current(u));
  }, [element.current]);
}
