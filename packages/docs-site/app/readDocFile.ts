import path from "path";
import type { Plugin } from "unified";
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
import remarkEmoji from "remark-emoji";
import visit from "unist-util-visit";

// Listen to all changes in the docs so it will trigger HMR on Markdown change
import "watch-glob:../docs/**/*.md";
import { convertDocPathToLink } from "./docList";

export type Doc = { content: string; title: string; description?: string };

export async function readDocFile(givenPath: string): Promise<Doc | null> {
  const pathParts =
    givenPath
      .replace(/-/g, "_")
      .split("/")
      .map((x) => `*_${x}`)
      .join("/") + ".md";

  const fullPattern = path.resolve(
    process.env.REMASTERED_PROJECT_DIR!,
    "docs",
    pathParts
  );

  const root = path.resolve(process.env.REMASTERED_PROJECT_DIR!, "docs");

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
    .use(remarkEmoji, { padSpaceAfter: true })
    .use(replaceLocalMarkdownLinkWithActualContent)
    .use(remarkHtml);
  const processed = await parser.process(body);
  return {
    content: String(processed),
    title: (attributes as any).title,
    description: (attributes as any).description,
  };
}

/**
 * This remark plugin replaces all relative markdown links to regular links:
 * * `../category/file.md` => `../category/file`
 * * `./file.md` => `./file`
 *
 * Later on we will use `useCatchLinks` to replace them with soft navigation
 */
const replaceLocalMarkdownLinkWithActualContent: Plugin = () => {
  return (tree) => {
    visit(tree, ["link"], (link) => {
      const url = link.url as string;
      if (url.startsWith(".") && url.endsWith(".md")) {
        link.url = convertDocPathToLink(url);
      }
    });
  };
};
