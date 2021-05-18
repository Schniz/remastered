import React from "react";
import { useLocation } from "remastered";

export default function Error404() {
  const { pathname } = useLocation();
  return (
    <>
      <h1>Oh no!!!!</h1>
      <p>
        I don't know what the route <code>{pathname}</code> means.
      </p>
    </>
  );
}
