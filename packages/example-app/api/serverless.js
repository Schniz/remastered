// @ts-check

import createVercelFunction from "@remastered/vercel/dist/function";
import { Request } from "node-fetch";
import _ from "lodash";
import path from "path";

/**
 * @param {Request} req
 * @param {import('@vercel/node').VercelResponse} res
 */
export default createVercelFunction(path.join(__dirname, ".."));
