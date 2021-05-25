import React from "react";
import type { Location } from "history";

export const PendingLocationContext =
  React.createContext<Location | undefined>(undefined);

export function usePendingLocation(): undefined | Location {
  return React.useContext(PendingLocationContext);
}
