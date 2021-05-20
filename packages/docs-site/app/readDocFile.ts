import path from "path";
import fm from "front-matter";
import remark from "remark";
import remarkHtml from "remark-html";
import fs from "fs-extra";
import globby from "globby";
import remarkShiki from "@stefanprobst/remark-shiki";
import theme from "./routes/docs/dracula-dot-min-white-darker.json";
import "watch-glob:../docs/**/*.md";
import remarkGfm from "remark-gfm";

export type Doc = { content: string; title: string };

export async function readDocFile(givenPath: string): Promise<Doc | null> {
  const pathParts =
    givenPath
      .replace(/-/g, "_")
      .split(":")
      .map((x) => `*_${x}`)
      .join("/") + ".md";

  const fullPattern = path.resolve(
    process.env.REMASTER_PROJECT_DIR!,
    "docs",
    pathParts
  );

  const root = path.resolve(process.env.REMASTER_PROJECT_DIR!, "docs");

  if (!fullPattern.startsWith(root)) {
    return null;
  }

  const [filepath] = await globby(fullPattern, { caseSensitiveMatch: false });

  if (!filepath) {
    return null;
  }

  const contents = await fs.readFile(filepath, "utf8");
  const { body, attributes } = fm(contents);
  const parser = remark()
    .use(remarkShiki, { theme: theme as any })
    .use(remarkGfm)
    .use(remarkHtml);
  const processed = await parser.process(body);
  return {
    content: String(processed),
    title: (attributes as any).title,
  };
}
