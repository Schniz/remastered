import "@types/node";

declare module "remark-prism";

declare global {
  declare const __remastered_root__: string;
  declare const __DEV__: boolean;
}
