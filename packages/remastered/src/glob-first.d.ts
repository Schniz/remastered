declare module "glob-first:*";

/**
 * Returns true if there's a glob match on the provided pattern.
 * This is generated in build time so we'll be able to tree-shake some contents
 */
declare function __glob_matches__(pattern: string): boolean;
