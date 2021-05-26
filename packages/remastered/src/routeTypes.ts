import type { LinkTag, MetaTags } from "./JsxForDocument";

export type LoaderFnOpts = {
  params: Record<string, string>;
  request: Request;
};
export type LoaderFn<Props> = (
  opts: LoaderFnOpts
) => Promise<Props | null | undefined>;
export type ActionFn = (opts: { request: Request }) => Promise<Response>;

export type LinksFn = () => LinkTag[] | Promise<LinkTag[]>;

export type HeadersFn = (opts: {
  request: Request;
}) => HeadersInit | Promise<HeadersInit>;

export type MetaFn<Props = unknown> = (opts: { data: Props }) => MetaTags;
