import config, { fileInCore } from "./vite.config";
import _ from "lodash";
import { UserConfigExport } from "vite";

export default _.merge<{}, UserConfigExport, UserConfigExport>({}, config, {
  build: {
    rollupOptions: {
      input: fileInCore("entry.server.js"),
    },
  },
});
