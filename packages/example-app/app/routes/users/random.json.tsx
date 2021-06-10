import { json } from "remastered";

export const loader = () => {
  console.log("Hello");
  return json({ randomNumber: Math.random() });
};
