import type { Request, Response } from "node-fetch";

export type LoaderFnOpts = {
  params: Record<string, string>;
};
export type LoaderFn<Props> = (
  opts: LoaderFnOpts
) => Promise<Props | null | undefined>;
export type ActionFn = (opts: { req: Request }) => Promise<Response>;
