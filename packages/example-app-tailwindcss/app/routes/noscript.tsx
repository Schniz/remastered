import React from "react";

export default function NoScript() {
  return (
    <div className="text-red-500 text-center">
      This text is red and centered!
    </div>
  );
}

export const handle = { noscript: true };
