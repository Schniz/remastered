import React from "react";
import { useRouteData } from "@remaster/core/dist/src/LoaderContext";
import {
  HeadersFn,
  LoaderFn,
  MetaFn,
} from "@remaster/core/dist/src/routeTypes";
import s from "./noscript.module.css";

type Data = { date: string };

export const headers: HeadersFn = () => {
  return {
    "x-remastered-app": "oh yeaaaaaah baby",
  };
};

export const meta: MetaFn = () => {
  return {
    title: "I have no script tags",
  };
};

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

export const handle = {
  noScripts: true,
};
