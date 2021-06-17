import superjson from "superjson";
import { deserializeResponse, serializeResponse } from "./SerializedResponse";

export function setup() {
  superjson.registerCustom<Response, any>(
    {
      isApplicable: (v: any): v is Response => v instanceof Response,
      serialize(response) {
        return serializeResponse(response);
      },
      deserialize(serialized) {
        return deserializeResponse(serialized);
      },
    },
    "Response"
  );
}

async function awaitDeep(unawaited: unknown): Promise<unknown> {
  const obj = await unawaited;

  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return Promise.all(obj.map((v) => awaitDeep(v)));
  }
  const res: Record<any, unknown> = {};
  const promises = [];
  for (const [key, value] of Object.entries(obj)) {
    promises.push(awaitDeep(value).then((v) => (res[key] = v)));
  }
  await Promise.all(promises);
  return res;
}

export async function serialize(value: unknown): Promise<unknown> {
  return awaitDeep(superjson.serialize(value));
}

export async function stringify(value: unknown): Promise<string> {
  return JSON.stringify(await serialize(value));
}

export const parse = superjson.parse;
export const deserialize = superjson.deserialize;
