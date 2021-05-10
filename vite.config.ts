import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import path from "path";

// https://vitejs.dev/config/
const config = defineConfig({
  plugins: [reactRefresh()],
  define: {
    __DEV__: process.env.NODE_ENV !== "production",
  },
  resolve: {
    alias: {
      "react-router": path.join(__dirname, "./react-router-pkgs/react-router"),
      "react-router-dom": path.join(
        __dirname,
        "./react-router-pkgs/react-router-dom"
      ),
    },
  },
  ...({
    ssr: {
      noExternal: [
        "react-router",
        "react-router-dom",
        "react-router-dom/server",
      ],
    },
  } as {}),
});

export default config;
