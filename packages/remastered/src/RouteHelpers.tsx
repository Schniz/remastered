import React from "react";
import { generatePath } from "react-router";
import { Link } from "react-router-dom";
import type { Routes } from "./_generated_types_";

export function routePath<Route extends keyof Routes>(
  route: Route,
  params: Record<Routes[Route], string>
): string {
  return generatePath(route, params);
}

type ParamsFor<Route extends keyof Routes> = [Routes[Route]] extends [never]
  ? { params?: Record<never, never> }
  : { params: Record<Routes[Route], string> };

export function ParamLink<Route extends keyof Routes>({
  route,
  params,
  ...props
}: {
  route: Route;
} & ParamsFor<Route> &
  Omit<React.ComponentProps<typeof Link>, "to">) {
  const path = routePath(route, params);
  return <Link {...props} to={path} />;
}
