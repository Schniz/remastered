export function redirectTo(url: string, opts?: ResponseInit): Response {
  return new Response("", {
    status: 302,
    ...opts,
    headers: {
      Location: url,
      ...opts?.headers,
    },
  });
}

export function json<T = unknown>(
  value: T,
  opts?: ResponseInit & {
    /**
     * Should the response fallthrough and render the underlying component?
     * @default true
     */
    fallthrough?: boolean;
  }
): Response {
  return new Response(JSON.stringify(value), {
    status: 200,
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(opts?.fallthrough !== false && {
        [REMASTERED_JSON_FALLBACK_HEADER]: "true",
      }),
      ...opts?.headers,
    },
  });
}

export const REMASTERED_JSON_FALLBACK_HEADER = "X-Remastered-Json-Fallback";
