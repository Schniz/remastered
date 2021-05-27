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

export function json<T = unknown>(value: T, opts?: ResponseInit): Response {
  return new Response(JSON.stringify(value), {
    status: 200,
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...opts?.headers,
    },
  });
}
