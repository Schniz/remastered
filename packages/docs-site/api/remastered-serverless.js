import { createVercelFunction } from "@remastered/vercel";
import path from "path";

const rootDir = path.join(__dirname, "..");

export default createVercelFunction({
  rootDir,
  serverEntry: () => import("../dist/server/entry.server.js"),
});
