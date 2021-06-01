import React from "react";
import ReactDOM from "react-dom";
import type { RemasteredApp } from "./RemasteredAppClient";

export type RenderClientEntryOptions = {
  Component: typeof RemasteredApp;
};
export type RenderClientEntryFn = (
  opts: RenderClientEntryOptions
) => Promise<void>;

export default async function defaultClientEntry(
  opts: RenderClientEntryOptions
) {
  ReactDOM.hydrate(
    <React.StrictMode>
      <opts.Component />
    </React.StrictMode>,
    document
  );
}
