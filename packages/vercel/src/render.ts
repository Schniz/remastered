import type { Request } from "node-fetch";
import type { HttpResponse } from "remastered/dist/HttpTypes";
import type { render as entryRender } from "remastered/dist/entry-server";
import type { getRenderContext } from "./getRenderContext";
import { shim } from "remastered/dist/shimReactContext";

export type ServerEntry = { render: typeof entryRender };

shim();

export async function render(opts: {
  serverEntry: Promise<ServerEntry>;
  renderContext: ReturnType<typeof getRenderContext>;
  request: Request;
}): Promise<HttpResponse> {
  const serverEntry = await opts.serverEntry;
  return serverEntry.render({
    request: opts.request,
    ...(await opts.renderContext),
  });
}
