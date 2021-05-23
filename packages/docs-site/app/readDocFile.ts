import path from "path";
import fm from "front-matter";
import remark from "remark";
import remarkHtml from "remark-html";
import fs from "fs-extra";
import globby from "globby";
import remarkShiki from "@stefanprobst/remark-shiki";
import theme from "./routes/docs/dracula-dot-min-white-darker.json";
import remarkGfm from "remark-gfm";
import tsxLanguage from "shiki/languages/tsx.tmLanguage.json";
import shellscriptLanguage from "shiki/languages/shellscript.tmLanguage.json";
import jsonLanguage from "shiki/languages/json.tmLanguage.json";

// Listen to all changes in the docs so it will trigger HMR on Markdown change
import "watch-glob:../docs/**/*.md";

export type Doc = { content: string; title: string; description?: string };

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
    .use(remarkShiki, {
      theme: theme as any,
      langs: [
        {
          id: "tsx",
          aliases: ["javascript", "js", "jsx", "ts", "typescript"],
          scopeName: "source.tsx",
          grammar: tsxLanguage as any,
        },
        {
          id: "shellscript",
          aliases: ["bash", "sh", "sh-session", "shellscript", "shell"],
          scopeName: "source.shell",
          grammar: shellscriptLanguage as any,
        },
        {
          id: "json",
          scopeName: "source.json",
          grammar: jsonLanguage as any,
        },
      ],
    })
    .use(remarkGfm)
    .use(remarkHtml);
  const processed = await parser.process(body);
  return {
    content: String(processed),
    title: (attributes as any).title,
    description: (attributes as any).description,
  };
}
