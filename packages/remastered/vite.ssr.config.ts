import config, { fileInCore } from "./vite.config";
import { merge } from "lodash";
import { UserConfigExport } from "vite";

export default merge<{}, UserConfigExport, UserConfigExport>({}, config, {
  build: {
    rollupOptions: {
      input: fileInCore("entry.server.js"),
    },
  },
});
