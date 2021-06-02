import { transform } from "./routeTransformers";

test("it removes the named exports", () => {
  const code = `
    import a from 'a';
    import b from 'b';

    type A<T> = T;

    export const loader = "yes";
    export const handle = "ho";
    export function myFunction() {}
    export default "Hey there";
  `;

  const result = transform(code, "filename.tsx");
  expect(result?.code).toMatchInlineSnapshot(`
    "
        import a from 'a';
        import b from 'b';

        type A<T> = T;

        
        export const handle = \\"ho\\";
        
        export default \\"Hey there\\";
      "
  `);
});
