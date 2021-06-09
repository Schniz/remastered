import React from "react";
import ReactDOMServer from "react-dom/server";
import { HttpRequest, HttpResponse } from "./HttpTypes";
import type { RemasteredAppServer } from "./RemasteredAppServer";
import type { RemasteredAppContext } from "./WrapWithContext";

export type RenderServerEntryOptions = {
  request: HttpRequest;
  ctx: RemasteredAppContext;
  /**
   * Get the HTTP status.
   * You might wonder why this is a function and not just a number.
   * This is because rendering the app could cause an HTTP status change
   * when there is an error in the rendering phase.
   */
  getHttpStatus(): number;
  getHttpHeaders(): Headers;
  Component: typeof RemasteredAppServer;
};

export type RenderServerEntryFn = (
  opts: RenderServerEntryOptions
) => Promise<HttpResponse>;

export default async function renderServer(
  opts: RenderServerEntryOptions
): Promise<Response> {
  const string = ReactDOMServer.renderToString(
    <opts.Component ctx={opts.ctx} requestedUrl={opts.request.url} />
  );

  return new Response(`<!DOCTYPE html>` + string, {
    status: opts.getHttpStatus(),
    headers: {
      "Content-Type": "text/html",
      ...Object.fromEntries(opts.getHttpHeaders().entries()),
    },
  });
}
