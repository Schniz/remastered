import { getAssetFromKV, NotFoundError } from "@cloudflare/kv-asset-handler";
import type { HttpResponse } from "remastered/dist/HttpTypes";
import { renderRequest, Renderer } from "remastered/dist/renderRequest";

export async function handleEvent(
  event: FetchEvent,
  opts: {
    renderer: Renderer;
    manifest: any;
    clientManifest: any;
  }
): Promise<HttpResponse> {
  try {
    const page = await getAssetFromKV(event, {});
    return page;
  } catch (e) {
    if (!(e instanceof NotFoundError)) {
      throw e;
    }
  }

  try {
    const request = event.request;
    const url = new URL(request.url);
    const newRequest = new Request(`${url.pathname}${url.search}`, {
      body: request.body,
      headers: request.headers,
      method: request.method,
      redirect: request.redirect,
    });
    const response = await renderRequest(opts.renderer, {
      request: newRequest,
      manifest: await opts.manifest,
      clientManifest: await opts.clientManifest,
    });
    return response;
  } catch (e) {
    return new Response(
      JSON.stringify({ message: e.message, stack: e.stack }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
