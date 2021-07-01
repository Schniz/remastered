import { HttpRequest } from "./HttpTypes";

/** Get query parameters from a request */
export function getQueryParams(request: HttpRequest): URLSearchParams {
  return new URL(request.url, "https://example.com").searchParams;
}
