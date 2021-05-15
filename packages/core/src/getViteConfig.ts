import fs from "fs";
import path from "path";

export function getViteConfigPath(opts: { ssr: boolean }): string {
  const filename = opts.ssr ? "vite.ssr.config.ts" : "vite.config.ts";
  return [
    path.join(__dirname, `../${filename}`),
    path.join(__dirname, `../../${filename}`),
  ].filter((v) => fs.existsSync(v))[0];
}
