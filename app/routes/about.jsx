import React from "react";
import { useRouteData } from "../../src/LoaderContext";

export async function loader() {
  return {
    date: new Date().toISOString(),
  };
}

export default function About() {
  const { date } = useRouteData();
  return <div>About us! {date.toString()}</div>;
}
