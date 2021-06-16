import { ActionFn } from "remastered";
import fs from "fs-extra";

export const action: ActionFn = async ({ request }) => {
  const ab = await request.arrayBuffer();
  const buffer = Buffer.from(ab);
  await fs.writeFile("/tmp/kaki", buffer);
  console.log([...request.headers]);
  return new Response("okay!");
};
