import { createRouteTreeFromImportGlob } from "./createRouteTreeFromImportGlob";

const LAZY_COMPONENT = Symbol.for("lazy component");
jest.mock("react", () => ({
  lazy: () => LAZY_COMPONENT,
}));

test("routes", () => {
  const result = createRouteTreeFromImportGlob({
    "../app/routes/users/@id.tsx": someComponent,
    "../app/routes/users.tsx": someComponent,
    "../app/routes/about.tsx": someComponent,
    "../app/routes/index.tsx": someComponent,
    "../app/routes/users.register.tsx": someComponent,
  });
  expect(result).toEqual({
    "/": {
      element: LAZY_COMPONENT,
      children: {},
    },
    "/about": {
      element: LAZY_COMPONENT,
      children: {},
    },
    "/users": {
      element: LAZY_COMPONENT,
      children: {
        "/:id": {
          element: LAZY_COMPONENT,
          children: {},
        },
      },
    },
    "/users/register": {
      element: LAZY_COMPONENT,
      children: {},
    },
  });
});

function SomeComponent() {
  return null;
}

const someComponent = async () => ({ default: SomeComponent });
