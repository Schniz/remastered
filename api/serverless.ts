// Require the framework
import Fastify from "fastify";
import { createServer } from "../src/server";

// Instantiate Fastify with some config
const app = Fastify({
  logger: true,
});

// Register your application as a normal plugin.
app.register(createServer() as any);

export default async (req: unknown, res: any) => {
  res.send("Helllllllllllo mister");
  // await app.ready();
  // app.server.emit("request", req, res);
};
