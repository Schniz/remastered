import { json } from "@remastered/core";

export const loader = () => json({ randomNumber: Math.random() });
