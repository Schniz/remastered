import type { RequestContext, render } from "./entry-server";
import { HttpResponse } from "./HttpTypes";
import { shim } from "./shimReactContext";

shim();

export async function renderRequest(
  renderer: { render: typeof render },
  context: RequestContext
): Promise<HttpResponse> {
  try {
    return await renderer.render(context);
  } catch (e) {
    // If an error is caught, let vite fix the stracktrace so it maps back to
    // your actual source code.
    context.viteDevServer?.ssrFixStacktrace(e);
    console.error(e);
    const message = context.request.headers.has("x-debug")
      ? String(e)
      : e.message;
    return new Response(message, {
      status: 500,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  }
}
