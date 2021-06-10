import { json } from "remastered";

export const loader = () => {
  return json({ randomNumber: Math.random() }, { fallthrough: false });
};
