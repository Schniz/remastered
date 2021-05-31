type Ogable = "description" | "title" | "image";
type Rec = Record<Ogable, string | undefined | null>;

export function ogMeta(record: Partial<Rec>): Record<string, string | null> {
  const meta: Record<string, string | null> = {};

  for (const [key, value] of Object.entries(record)) {
    if (value === undefined) continue;
    meta[key] = value;
    meta[`og:${key}`] = value;
  }

  console.log(meta);

  return meta;
}
