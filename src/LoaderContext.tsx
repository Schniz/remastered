import React from "react";

export const LoaderContext = React.createContext<Map<string, unknown>>(
  new Map()
);

// I need to figure out how to make it work.
// I need some magic to catch the current route key. Maybe I can populate it with contexts?
export function useRouteData() {
  const loaderContext = React.useContext(LoaderContext);
  console.log(loaderContext);
}
