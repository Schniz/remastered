import { createVercelFunction } from "@remastered/vercel";
import * as serverEntry from "../dist/server/server.entry";
import path from "path";

const rootDir = path.join(__dirname, "..");

export default createVercelFunction({ rootDir, serverEntry });
