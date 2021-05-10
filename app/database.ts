export type User = { name: string };
export const database = new Map<string, User>([
  ["gal", { name: "Gal Schlezinger" }],
  ["dean", { name: "Dean Shub" }],
  ["amitush", { name: "Amit Shalev" }],
  ["shirbz", { name: "Shir Ben Zvi" }],
]);
