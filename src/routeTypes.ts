export type LoaderFnOpts = {
  params: Record<string, string>;
};
export type LoaderFn<Props> = (
  opts: LoaderFnOpts
) => Promise<Props | null | undefined>;
