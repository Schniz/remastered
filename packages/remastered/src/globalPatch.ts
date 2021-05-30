import fetch, { Response, Request, Headers } from "node-fetch";
export function globalPatch() {
  // @ts-expect-error types are not 100% aligned
  global.fetch = fetch;
  // @ts-expect-error types are not 100% aligned
  global.Response = Response;
  // @ts-expect-error types are not 100% aligned
  global.Request = Request;
  // @ts-expect-error types are not 100% aligned
  global.Headers = Headers;
}
