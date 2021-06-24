export const MAGIC_METHOD_QUERY_PARAM = "_remastered_method_";

export function readMagicMethodQueryParam(
  searchParams: URLSearchParams
): [string | null, URLSearchParams] {
  const method = searchParams.get(MAGIC_METHOD_QUERY_PARAM)?.toUpperCase();
  if (!method) {
    return [null, searchParams];
  }

  const newUrlSearchParams = new URLSearchParams(searchParams);
  newUrlSearchParams.delete(MAGIC_METHOD_QUERY_PARAM);
  return [method, newUrlSearchParams];
}
