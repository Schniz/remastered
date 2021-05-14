import type { Request, Response, HeadersInit } from "node-fetch";
import { LinkTag } from "./JsxForDocument";

export type LoaderFnOpts = {
  params: Record<string, string>;
};
export type LoaderFn<Props> = (
  opts: LoaderFnOpts
) => Promise<Props | null | undefined>;
export type ActionFn = (opts: { req: Request }) => Promise<Response>;

export type LinksFn = () => LinkTag[] | Promise<LinkTag[]>;

export type HeadersFn = () => HeadersInit | Promise<HeadersInit>;
