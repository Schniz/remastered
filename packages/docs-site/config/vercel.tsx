import { docList, FileEntry } from "../app/docList";

export async function getStaticRoutes(): Promise<string[]> {
  const docs = await docList();
  const docUrls: string[] = [];
  const queue: FileEntry[] = [...docs];

  while (queue.length > 0) {
    const file = queue.shift()!;
    if (file.type === "dir") {
      queue.push(...file.children);
    } else {
      docUrls.push(`/docs/${file.link}`);
    }
  }

  return [...docUrls, "/docs", "/"];
}
