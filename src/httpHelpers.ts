export function redirectTo(url: string): Response {
  return new Response("", {
    status: 302,
    headers: {
      Location: url,
    },
  });
}

export function json<T = unknown>(value: T, opts?: ResponseInit): Response {
  return new Response(JSON.stringify(value), opts);
}
