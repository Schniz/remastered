import { handleEvent } from "@remastered/cloudflare-workers";
import * as renderer from "./rdist/server/entry.server.js";
import manifest from "./rdist/client/ssr-manifest.json";
import clientManifest from "./rdist/client/manifest.json";

addEventListener("fetch", (event) => {
  const response = handleEvent(event, { renderer, manifest, clientManifest });
  event.respondWith(response);
});
