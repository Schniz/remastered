import { json } from "@remaster/core/dist/src/httpHelpers";

export const loader = () => json({ randomNumber: Math.random() });
