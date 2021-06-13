const {
  createVercelFunction,
  shimReactContext,
} = require("@remastered/vercel");
const path = require("path");

shimReactContext();
const rootDir = path.join(__dirname, "..");

export default createVercelFunction({
  rootDir,
  serverEntry: () => import("../dist/server/entry.server.js"),
});
