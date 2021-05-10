export type User = { name: string };
export const database = new Map<string, User>([
  ["gal", { name: "Gal Schlezinger" }],
  ["shir", { name: "Shir Ben Zvi" }],
  ["dean", { name: "Dean Shub" }],
  ["amitush", { name: "Amit Shalev" }],
]);
