import globby from "globby";
import fs from "fs";

/**
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 */
export default async function listFiles(req, res) {
  const pattern = String(req.query.pattern ?? "/*");
  const files = await globby(pattern);
  if (files.length === 1) {
    res.send(fs.readFileSync(files[0], "utf8"));
  } else {
    res.send({
      pattern,
      files,
      cwd: process.cwd(),
      dirname: __dirname,
    });
  }
}
