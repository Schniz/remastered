import { Response } from "node-fetch";

export function redirectTo(url: string): Response {
  return new Response("", {
    status: 302,
    headers: {
      Location: url,
    },
  });
}
