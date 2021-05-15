// @ts-check

import createVercelFunction from "@remastered/vercel/dist/function";
import * as serverEntry from "../dist/server/entry.server";
import path from "path";

const rootDir = path.join(__dirname, "..");

export default createVercelFunction({ rootDir, serverEntry });
