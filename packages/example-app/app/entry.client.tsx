import { Remastered } from "@remastered/core";
import ReactDOM from "react-dom";
import React from "react";

export async function entry() {
  /* console.log(`current html is`, document.documentElement.outerHTML); */
  console.log("hydrating...");
  ReactDOM.hydrate(
    <React.StrictMode>
      <Remastered />
    </React.StrictMode>,
    document
  );
  /* console.log(`hydrated html is`, document.documentElement.outerHTML); */
}
