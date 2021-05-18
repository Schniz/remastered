import { createRouteTreeFromImportGlob } from "./createRouteTreeFromImportGlob";

test("routes", () => {
  const result = createRouteTreeFromImportGlob({
    "/app/routes/users/@id.tsx": SomeComponent,
    "/app/routes/users.tsx": SomeComponent,
    "/app/routes/about.tsx": SomeComponent,
    "/app/routes/index.tsx": SomeComponent,
    "/app/routes/users.register.tsx": SomeComponent,
  });
  expect(result).toEqual({
    "/": {
      element: SomeComponent,
      children: {},
      filepath: "/app/routes/index.tsx",
    },
    "/about": {
      element: SomeComponent,
      children: {},
      filepath: "/app/routes/about.tsx",
    },
    "/users": {
      element: SomeComponent,
      filepath: "/app/routes/users.tsx",
      children: {
        "/:id": {
          element: SomeComponent,
          filepath: "/app/routes/users/@id.tsx",
          children: {},
        },
      },
    },
    "/users/register": {
      element: SomeComponent,
      children: {},
      filepath: "/app/routes/users.register.tsx",
    },
  });
});

function SomeComponent() {
  return null;
}
