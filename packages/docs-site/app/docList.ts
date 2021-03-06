import globby from "globby";
import path from "path";
import _ from "lodash";
import fm from "front-matter";
import fs from "fs";

export type Directory = { type: "dir"; title: string; children: FileEntry[] };
export type File = { type: "file"; title: string; link: string };
export type FileEntry = Directory | File;

export async function docList(): Promise<FileEntry[]> {
  const files = await globby("docs/**/*.md", {
    cwd: String(process.env.REMASTERED_PROJECT_DIR),
  });
  const categories = _(files)
    .map((p) => p.replace("../../", ""))
    .map((path) => {
      const category = path.replace("docs/", "").split("/");
      return {
        path,
        category,
      };
    })
    .groupBy((x) => x.category.slice(0, -1))
    .mapValues((x): FileEntry[] => {
      return x.map((file): FileEntry => {
        const contents = fs.readFileSync(
          path.join(process.env.REMASTERED_PROJECT_DIR!, file.path),
          "utf8"
        );
        const { attributes } =
          fm<{ title?: string; link_title?: string }>(contents);
        return {
          type: "file",
          link: convertDocPathToLink(file.path),
          title: attributes.link_title ?? attributes.title ?? file.path,
        };
      });
    })
    .entries()
    .sortBy(([key]) => {
      const number = parseInt(key.split("_")[0], 10);
      return number;
    })
    .map(([category, value]): FileEntry => {
      return {
        type: "dir",
        title: category.replace(/^\d+_/, ""),
        children: value,
      };
    })
    .value();

  return categories;
}

export function convertDocPathToLink(docPath: string): string {
  return docPath
    .replace(/^docs\//, "")
    .replace(/(^|\/)(\d+)_/g, "$1")
    .replace(/_/g, "-")
    .replace(/\.md$/, "")
    .toLowerCase();
}
