import * as Error404Object from "glob-first:/app/routes/404.{t,j}s{x,};./Error404.{t,j}s{x,}";
import * as Error500Object from "glob-first:/app/routes/500.{t,j}s{x,};./Error500.{t,j}s{x,}";
import * as LayoutObject from "glob-first:/app/layout.{t,j}s{x,};./DefaultLayout.{t,j}s{x,}";

export const Error404 = Error404Object.default;
export const Layout = LayoutObject.default;
export const Error500 = Error500Object.default;

export { Error404Object, LayoutObject, Error500Object };
