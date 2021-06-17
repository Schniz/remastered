import globby from "globby";
import { formatRoutePath } from "./createRouteTreeFromImportGlob";
import fs from "fs-extra";
import path from "path";

export async function generateTypes(opts: { cwd: string }) {
  const files = await globby("**/*.{t,j}sx", {
    cwd: path.join(opts.cwd, "app", "routes"),
  });
  const routes = files.map((f) => {
    return f.split("/").map(formatRoutePath).join("");
  });
  const dtsFile = `
import type { ParseRoutes } from './generateTypes';
export type Routes = ParseRoutes<${JSON.stringify(routes)}>;
  `.trim();
  const output = require.resolve("remastered/dist/_generated_types_.d.ts");
  const currentFile = await fs.readFile(output, "utf8").catch(() => null);

  if (dtsFile !== currentFile) {
    await fs.outputFile(output, dtsFile);

    console.log(`🎷 Route types were generated to ${output}`);
  }
}

type ALLOWED_IDENTIFIER_NAME = [
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "_"
][number];

type ParseParam<GivenStr extends string, ParamNameSoFar extends string = ""> =
  GivenStr extends `${ALLOWED_IDENTIFIER_NAME}${infer End}`
    ? GivenStr extends `${infer Char}${End}`
      ? ParseParam<End, `${ParamNameSoFar}${Char}`>
      : [ParamNameSoFar, End]
    : [ParamNameSoFar, GivenStr];

type ParamSeparator = "/" | "." | "-";
type RouteParser<RouteStr extends string, Params extends string = never> =
  RouteStr extends `${infer _Before}:${infer Param}${ParamSeparator}${infer End}`
    ? RouteParser<End, Params | ParseParam<Param>[0]>
    : RouteStr extends `${infer _Before}:${infer Param}`
    ? Params | Param
    : Params;

export type ParseRoutes<Routes extends readonly string[]> = {
  [key in keyof Routes as Extract<Routes[key], string>]: RouteParser<
    Extract<Routes[key & string], string>
  >;
};

export type ParamlessRoutes<Routes> = Pick<
  Routes,
  {
    [key in keyof Routes]: [Routes[key]] extends [never] ? key : never;
  }[keyof Routes]
>;
export type ParameterizedRoutes<Routes> = Omit<
  Routes,
  keyof ParamlessRoutes<Routes>
>;