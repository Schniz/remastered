import React from "react";
import { useRouteData } from "../../src/LoaderContext";
import { LoaderFn } from "../../src/routeTypes";
import s from "./noscript.module.css";

type Data = { date: string };

export const loader: LoaderFn<Data> = async () => {
  return {
    date: String(new Date()),
  };
};

export default function NoScript() {
  const { date } = useRouteData<Data>();

  return (
    <>
      <h1>No Script Tags!</h1>
      <p>This page is without scripts. Just plain SSR!</p>
      <p className={s.renderedFooter}>Page rendered at {date}</p>
    </>
  );
}
