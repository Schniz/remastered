import { json } from "../../../src/httpHelpers";

export const loader = () => json({ randomNumber: Math.random() });
