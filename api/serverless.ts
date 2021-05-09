import { createServer } from "../src/server";

const server = createServer();

export default async (req: unknown, res: any) => {
  const app = await server;
  await app.ready();
  app.server.emit("request", req, res);
};
