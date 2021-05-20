import {
  run,
  subcommands,
  binary,
  command,
  option,
  number,
  optional,
} from "cmd-ts";
import path from "path";

const build = command({
  name: "build",
  args: {},
  async handler() {
    const vite = await import("vite");
    const { getViteConfigPath } = await import("./getViteConfig");

    await Promise.all([
      vite.build({
        configFile: getViteConfigPath({ ssr: false }),
        build: {
          manifest: true,
          ssrManifest: true,
          outDir: path.join(process.cwd(), "dist", "client"),
        },
      }),
      vite.build({
        configFile: getViteConfigPath({ ssr: true }),
        define: {
          "process.env.REMASTER_PROJECT_DIR":
            "process.env.REMASTER_PROJECT_DIR",
        },
        build: {
          ssr: "src/entry-server.tsx",
          outDir: path.join(process.cwd(), "dist", "server"),
        },
      }),
    ]);
  },
});

const serve = command({
  name: "serve",
  description: `Serve a production build`,
  args: {
    port: option({
      type: optional(number),
      long: "port",
      short: "p",
      env: "PORT",
    }),
  },
  async handler({ port }) {
    if (typeof port === "number") {
      process.env.PORT = String(port);
    }
    process.env.NODE_ENV = "production";

    const { main } = await import("./server");
    await main(process.cwd());
  },
});

const dev = command({
  name: `dev`,
  description: `Run a development server`,
  args: {
    port: option({
      type: {
        ...optional(number),
        defaultValue: () => 3000,
        defaultValueIsSerializable: true,
      },
      long: "port",
      short: "p",
      env: "PORT",
    }),
  },
  async handler({ port }) {
    if (typeof port === "number") {
      process.env.PORT = String(port);
    }
    const { main } = await import("./server");
    await main(process.cwd());
  },
});

const cli = subcommands({
  cmds: { build, serve, dev },
  name: "remastered",
  description: "A full-stack approach.",
});

run(binary(cli), process.argv);
