import { Response as NFResponse } from "node-fetch";

export type HttpRequest = Request | import("node-fetch").Request;
export type HttpResponse = Response | import("node-fetch").Response;

export function isHttpResponse(x: any): x is HttpResponse {
  return x instanceof Response || x instanceof NFResponse;
}
