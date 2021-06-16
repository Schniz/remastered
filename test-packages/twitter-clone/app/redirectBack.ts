import { redirectTo } from "remastered";
import type { HttpRequest } from "remastered/dist/HttpTypes";

export function redirectBack(
  request: HttpRequest,
  { fallback, ...opts }: ResponseInit & { fallback: string }
): Response {
  const referrer = request.headers.get("referer");
  return redirectTo(referrer ?? fallback, opts);
}
