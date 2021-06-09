import React from "react";

/** Set status codes on back-end calls */
export const SetStatusCodeContext = React.createContext<
  (value: number) => void
>(() => {});

export function SetStatusCodeProvider(props: {
  value?: React.ContextType<typeof SetStatusCodeContext>;
  children: React.ReactElement;
}) {
  if (!props.value) {
    return props.children;
  }

  return (
    <SetStatusCodeContext.Provider
      value={props.value}
      children={props.children}
    />
  );
}
