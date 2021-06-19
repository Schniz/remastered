import type { Request } from "node-fetch";
import type { HttpResponse } from "remastered/cjs/HttpTypes";
import type { render as entryRender } from "remastered/cjs/entry-server";
import type { getRenderContext } from "./getRenderContext";
import { shim } from "remastered/cjs/shimReactContext";

export type ServerEntry = { render: typeof entryRender };

shim();

export async function render(opts: {
  serverEntry: ServerEntry;
  renderContext: ReturnType<typeof getRenderContext>;
  request: Request;
}): Promise<HttpResponse> {
  return opts.serverEntry.render({
    request: opts.request,
    ...(await opts.renderContext),
  });
}
