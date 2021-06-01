import React from "react";
import { StaticRouter } from "react-router-dom/server";
import App from "./App";
import { RemasteredAppServerCtx, WrapWithContext } from "./WrapWithContext";

export function RemasteredAppServer({
  ctx,
  requestedUrl,
}: {
  ctx: RemasteredAppServerCtx;
  requestedUrl: string;
}) {
  return (
    <WrapWithContext ctx={ctx}>
      <StaticRouter location={requestedUrl}>
        <App />
      </StaticRouter>
    </WrapWithContext>
  );
}
