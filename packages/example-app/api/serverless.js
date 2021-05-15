// @ts-check

import createVercelFunction from "@remastered/vercel/dist/function";
import path from "path";

export default createVercelFunction(path.join(__dirname, ".."));
