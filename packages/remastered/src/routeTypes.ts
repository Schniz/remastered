import type { HttpRequest, HttpResponse } from "./HttpTypes";
import type { LinkTag, MetaTags } from "./JsxForDocument";

export type LoaderFnOpts = {
  params: Record<string, string>;
  request: HttpRequest;
};
export type LoaderFn<Props> = (
  opts: LoaderFnOpts
) => Promise<Props | null | undefined>;
export type ActionFn = (opts: {
  request: HttpRequest;
  params: Record<string, string>;
}) => Promise<HttpResponse>;

export type LinksFn = () => LinkTag[] | Promise<LinkTag[]>;

export type HeadersFn = (opts: {
  request: HttpRequest;
}) => HeadersInit | Promise<HeadersInit>;

export type MetaFn<Props = unknown> = (opts: { data: Props }) => MetaTags;
