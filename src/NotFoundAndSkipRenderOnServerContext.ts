import React from "react";

type ResponseState = "ok" | "not_found";
/** Keys are `history.state.key` or `useLocation().key` */
export type HistoryResponseState = Map<string, ResponseState>;
export const NotFoundAndSkipRenderOnServerContext = React.createContext<{
  state?: HistoryResponseState;
  setState?(key: string, value: ResponseState): void;
}>({});
