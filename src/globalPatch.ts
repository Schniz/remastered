import fetch, { Response, Request, Headers } from "node-fetch";
export function globalPatch() {
  global.fetch = fetch as any;
  global.Response = Response as any;
  global.Request = Request as any;
  global.Headers = Headers as any;
}
