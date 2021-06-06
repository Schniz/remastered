import React from "react";
import ReactDOM from "react-dom/server";
import { RenderServerEntryFn } from "remastered";

const render: RenderServerEntryFn = async (opts) => {
  const html = ReactDOM.renderToString(
    <opts.Component ctx={opts.ctx} requestedUrl={opts.request.url} />
  );
  return new Response(`<!DOCTYPE html><!-- example -->${html}`, {
    status: opts.getHttpStatus(),
    headers: {
      "Content-Type": "text/html",
      ...opts.getHttpHeaders(),
    },
  });
};

export default render;
