import { Response as NFResponse } from "node-fetch";

type NFRequest = import("node-fetch").Request;

export type HttpRequest = IsAny<NFRequest> extends true
  ? Request
  : Request | NFRequest;
export type HttpResponse = IsAny<NFResponse> extends true
  ? Response
  : Response | NFResponse;

export function isHttpResponse(x: any): x is HttpResponse {
  return x instanceof Response || x instanceof NFResponse;
}

type __ = { readonly a: unique symbol };
type IsAny_<T> = T extends __ ? true : false;
type IsAny<T> = true extends IsAny_<T> ? true : false;
