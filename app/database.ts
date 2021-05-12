export type User = { name: string; slug: string };
export const database = new Map<string, User>([
  ["gal", { name: "Gal Schlezinger", slug: "gal" }],
  ["shir", { name: "Shir Ben Zvi", slug: "shir" }],
  ["dean", { name: "Dean Shub", slug: "dean" }],
  ["amitush", { name: "Amit Shalev", slug: "amitush" }],
]);
