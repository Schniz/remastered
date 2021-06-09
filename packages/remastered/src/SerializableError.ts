import {
  serializeError as serialize,
  deserializeError as deserialize,
} from "serialize-error";

export function serializeError(value: unknown): unknown {
  if (value instanceof Error) {
    const err = serialize(value);
    return { ...err, "@remastered/error": 1 };
  }

  return value;
}

export function deserializeError(value: unknown): unknown {
  if (typeof value === "object" && value && "@remastered/error" in value) {
    const err = { ...value };
    // @ts-ignore
    delete err["@remastered/error"];
    return deserialize(err);
  }

  return value;
}
