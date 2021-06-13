import { shim } from "../../remastered/dist/shimReactContext";
shim();

import {
  getAssetFromKV,
  mapRequestToAsset,
  NotFoundError,
} from "@cloudflare/kv-asset-handler";
import manifest from "../rdist/client/ssr-manifest.json";
import clientManifest from "../rdist/client/manifest.json";

/**
 * The DEBUG flag will do two things that help during development:
 * 1. we will skip caching on the edge, which makes it easier to
 *    debug.
 * 2. we will return an error message on exception in your Response rather
 *    than the default 404.html page.
 */
const DEBUG = false;

addEventListener("fetch", (event) => {
  event.respondWith(handle2(event));
});

async function handle2(event) {
  try {
    const page = await getAssetFromKV(event, {});
    return page;
  } catch (e) {
    if (!(e instanceof NotFoundError)) {
      throw e;
    }
  }

  try {
    const { render } = await import("../rdist/server/entry.server");
    const request = event.request;
    const url = new URL(request.url);
    const newRequest = new Request(`${url.pathname}${url.search}`, {
      body: request.body,
      headers: request.headers,
      method: request.method,
      redirect: request.redirect,
    });
    const response = await render({
      request: newRequest,
      manifest,
      clientManifest,
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

async function handleEvent(event) {
  let options = {};

  /**
   * You can add custom logic to how we fetch your assets
   * by configuring the function `mapRequestToAsset`
   */
  // options.mapRequestToAsset = handlePrefix(/^\/docs/)

  try {
    if (DEBUG) {
      // customize caching
      options.cacheControl = {
        bypassCache: true,
      };
    }

    const page = await getAssetFromKV(event, options);

    // allow headers to be altered
    const response = new Response(page.body, page);

    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "unsafe-url");
    response.headers.set("Feature-Policy", "none");

    return response;
  } catch (e) {
    // if an error is thrown try to serve the asset at 404.html
    if (!DEBUG) {
      try {
        let notFoundResponse = await getAssetFromKV(event, {
          mapRequestToAsset: (req) =>
            new Request(`${new URL(req.url).origin}/404.html`, req),
        });

        return new Response(notFoundResponse.body, {
          ...notFoundResponse,
          status: 404,
        });
      } catch (e) {}
    }

    return new Response(e.message || e.toString(), { status: 500 });
  }
}

/**
 * Here's one example of how to modify a request to
 * remove a specific prefix, in this case `/docs` from
 * the url. This can be useful if you are deploying to a
 * route on a zone, or if you only want your static content
 * to exist at a specific path.
 */
function handlePrefix(prefix) {
  return (request) => {
    // compute the default (e.g. / -> index.html)
    let defaultAssetKey = mapRequestToAsset(request);
    let url = new URL(defaultAssetKey.url);

    // strip the prefix from the path for lookup
    url.pathname = url.pathname.replace(prefix, "/");

    // inherit all other props from the default request
    return new Request(url.toString(), defaultAssetKey);
  };
}
