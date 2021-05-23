import type { GetStaticPathsFn } from "@remastered/vercel";
import { docList, FileEntry } from "../app/docList";

export const getStaticPaths: GetStaticPathsFn = async () => {
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
};
