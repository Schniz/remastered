import React from "react";
import { generatePath } from "react-router";
import { NavLink, Link } from "react-router-dom";
import "./_generated_types_";

export function routePath<Route extends keyof Remastered.Routes>(
  route: Route,
  params: Record<Remastered.Routes[Route], string>
): string {
  return generatePath(route, params);
}

type ParamsFor<Route extends keyof Remastered.Routes> = [
  Remastered.Routes[Route]
] extends [never]
  ? { params?: Record<never, never> }
  : { params: Record<Remastered.Routes[Route], string> };

export function ParamLink<Route extends keyof Remastered.Routes>({
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

export function ParamNavLink<Route extends keyof Remastered.Routes>({
  route,
  params,
  ...props
}: {
  route: Route;
} & ParamsFor<Route> &
  Omit<React.ComponentProps<typeof NavLink>, "to">) {
  const path = routePath(route, params);
  return <NavLink {...props} to={path} />;
}
