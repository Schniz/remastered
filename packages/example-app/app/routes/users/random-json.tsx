import { json } from "@remaster/core";

export const loader = () => json({ randomNumber: Math.random() });
