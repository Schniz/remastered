import { getGeneratedRoutes } from "./generateTypes";

test("generates routes", () => {
  const result = getGeneratedRoutes({
    files: [
      "users/@id.tsx",
      "users.tsx",
      "index.tsx",
      "users~register.tsx",
      "with-nesting/@nestA/@nestB.tsx",
      "@@@username.tsx",
      "_nextjs/[param].tsx",
      "_nextjs_splat/[...splat].tsx",
      "splat/@_splat_.tsx",
    ],
  });

  expect(result).toEqual<typeof result>([
    { route: "/users/:id", params: ["id"], filePath: "users/@id.tsx" },
    { filePath: "users.tsx", params: [], route: "/users" },
    { filePath: "index.tsx", params: [], route: "/" },
    { filePath: "users~register.tsx", params: [], route: "/users/register" },
    {
      filePath: "with-nesting/@nestA/@nestB.tsx",
      params: ["nestA", "nestB"],
      route: "/with-nesting/:nestA/:nestB",
    },
    { filePath: "@@@username.tsx", params: ["username"], route: "/@:username" },
    {
      filePath: "_nextjs/[param].tsx",
      params: ["param"],
      route: "/_nextjs/:param",
    },
    {
      filePath: "_nextjs_splat/[...splat].tsx",
      params: ["*"],
      route: "/_nextjs_splat/*",
    },
    { filePath: "splat/@_splat_.tsx", route: "/splat/*", params: ["*"] },
  ]);
});
