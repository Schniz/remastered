import React from "react";
import { StaticRouter } from "react-router-dom/server";
import App from "./App";
import { RemasteredAppContext, WrapWithContext } from "./WrapWithContext";

export function RemasteredAppServer({
  ctx,
  requestedUrl,
}: {
  ctx: RemasteredAppContext;
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
