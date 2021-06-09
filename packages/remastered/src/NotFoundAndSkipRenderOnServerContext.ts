import React from "react";
import { useLocation } from "react-router";

export type ResponseState =
  | { tag: "ok" }
  | { tag: "not_found" }
  | { tag: "error"; routeKey: string };
/** Keys are `history.state.key` or `useLocation().key` */
export type HistoryResponseState = Map<string, ResponseState>;
export const NotFoundAndSkipRenderOnServerContext =
  React.createContext<HistoryResponseState>(new Map());

export function useRenderingError(): ResponseState | undefined {
  const ctx = React.useContext(NotFoundAndSkipRenderOnServerContext);
  const key = useLocation().key;
  return ctx.get(key);
}
