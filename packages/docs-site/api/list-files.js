import globby from "globby";

/**
 * @param {import('@vercel/node').VercelRequest} req
 * @param {import('@vercel/node').VercelResponse} res
 */
export default async function listFiles(req, res) {
  const pattern = String(req.query.pattern ?? "/*");
  const files = await globby(pattern);
  res.send({
    pattern,
    files,
    cwd: process.cwd(),
    dirname: __dirname,
  });
}
