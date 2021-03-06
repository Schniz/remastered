import {
  run,
  subcommands,
  binary,
  command,
  option,
  number,
  optional,
  oneOf,
  extendType,
} from "cmd-ts";
import path from "path";

const isCodeSandbox = Boolean(process.env.CODESANDBOX_SSE);

async function runPromises<T extends (() => Promise<any>)[]>(
  method: "serial" | "parallel",
  promises: T
) {
  if (method === "parallel") {
    return Promise.all(promises.map((f) => f()));
  }

  const results: any[] = [];
  for (const fn of promises) {
    results.push(await fn());
  }

  return results;
}

const generate = command({
  name: "generate",
  args: {},
  async handler() {
    const { generateTypes } = await import("./generateTypes");
    await generateTypes({ cwd: process.cwd(), storeInApp: isCodeSandbox });
  },
});

const build = command({
  name: "build",
  args: {
    method: option({
      long: "method",
      type: extendType(oneOf(["parallel", "serial"]), {
        from: async (a) => a,
        defaultValue: () => "parallel",
        defaultValueIsSerializable: true,
      }),
    }),
  },
  async handler(args) {
    const { generateTypes } = await import("./generateTypes");
    await generateTypes({ cwd: process.cwd(), storeInApp: isCodeSandbox });

    const vite = await import("vite");
    const { getViteConfigPath } = await import("./getViteConfig");

    process.env.NODE_ENV = "production";

    await runPromises(args.method, [
      () =>
        vite.build({
          configFile: getViteConfigPath({ ssr: false }),
          define: {
            "process.env.REMASTERED_PROJECT_DIR": JSON.stringify(""),
          },
          build: {
            manifest: true,
            ssrManifest: true,
            outDir: path.join(process.cwd(), "dist", "client"),
          },
        }),
      () =>
        vite.build({
          configFile: getViteConfigPath({ ssr: true }),
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

    const dotenv = await import("dotenv");
    dotenv.config();

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
    const { generateTypes } = await import("./generateTypes");
    const chokidar = await import("chokidar");

    const rootDir = process.cwd();
    if (typeof port === "number") {
      process.env.PORT = String(port);
    }

    await generateTypes({ cwd: rootDir, storeInApp: isCodeSandbox });

    chokidar
      .watch("app/routes", { cwd: rootDir })
      .on("all", () =>
        generateTypes({ cwd: rootDir, storeInApp: isCodeSandbox })
      )
      .on("unlink", () =>
        generateTypes({ cwd: rootDir, storeInApp: isCodeSandbox })
      );

    const dotenv = await import("dotenv");
    dotenv.config();

    const { main } = await import("./server");
    await main(rootDir);
  },
});

const cli = subcommands({
  cmds: { build, serve, dev, generate },
  name: "remastered",
  description: "A full-stack approach.",
});

run(binary(cli), process.argv);
