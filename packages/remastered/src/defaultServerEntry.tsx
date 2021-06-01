import React from "react";
import ReactDOMServer from "react-dom/server";
import { HttpRequest, HttpResponse } from "./HttpTypes";
import type { RemasteredAppServer } from "./RemasteredAppServer";
import type { RemasteredAppContext } from "./WrapWithContext";

export type RenderServerEntryOptions = {
  request: HttpRequest;
  ctx: RemasteredAppContext;
  httpStatus: number;
  httpHeaders: Headers;
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
    status: opts.httpStatus,
    headers: {
      "Content-Type": "text/html",
      ...Object.fromEntries(opts.httpHeaders.entries()),
    },
  });
}
