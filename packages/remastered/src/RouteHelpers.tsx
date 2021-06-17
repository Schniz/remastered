import React from "react";
import type { Routes } from "./_generated_types_";
import { generatePath } from "react-router";
import { Link } from "react-router-dom";

export function routePath<Route extends keyof Routes>(
  route: Route,
  params: Record<Routes[Route], string>
): string {
  return generatePath(route, params);
}

export function ParamLink<Route extends keyof Routes>({
  route,
  params,
  ...props
}: {
  route: Route;
  params: Record<Routes[Route], string>;
} & Omit<React.ComponentProps<typeof Link>, "to">) {
  const path = routePath(route, params);
  return <Link {...props} to={path} />;
}
