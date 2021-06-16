import { createRouteTreeFromImportGlob } from "./createRouteTreeFromImportGlob";

test("routes", () => {
  const result = createRouteTreeFromImportGlob({
    "/app/routes/users/@id.tsx": SomeComponent,
    "/app/routes/users.tsx": SomeComponent,
    "/app/routes/about.tsx": SomeComponent,
    "/app/routes/index.tsx": SomeComponent,
    "/app/routes/users~register.tsx": SomeComponent,
    "/app/routes/with-nesting/@nestA/@nestB.tsx": SomeComponent,
    "/app/routes/@@@username.tsx": SomeComponent,
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
    "/@:username": {
      element: SomeComponent,
      children: {},
      filepath: "/app/routes/@@@username.tsx",
    },
    "/with-nesting": {
      children: {
        "/:nestA": {
          children: {
            "/:nestB": {
              element: SomeComponent,
              filepath: "/app/routes/with-nesting/@nestA/@nestB.tsx",
              children: {},
            },
          },
        },
      },
    },
    "/users/register": {
      element: SomeComponent,
      children: {},
      filepath: "/app/routes/users~register.tsx",
    },
  });
});

function SomeComponent() {
  return null;
}
