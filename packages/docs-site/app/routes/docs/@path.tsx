import React from "react";
import { HeadersFn, LoaderFn, MetaFn, useRouteData } from "remastered";
import { Doc, readDocFile } from "../../readDocFile";

export const loader: LoaderFn<Doc> = async ({ params }) => {
  /* const { readDocFile } = await import("../../readDocFile"); */
  return readDocFile(params.path);
};

export const headers: HeadersFn = async () => {
  return {
    ...(!__DEV__ && {
      "Cache-Control": "public, max-age=3600, must-revalidate",
    }),
  };
};

export default function DocPath() {
  const routeData = useRouteData<Doc>();
  return (
    <>
      <h1 className="py-4 text-xl font-bold text-black text-opacity-90">
        {routeData.title}
      </h1>
      <div
        className="w-screen prose"
        dangerouslySetInnerHTML={{ __html: routeData.content }}
      />
    </>
  );
}

export const meta: MetaFn<Doc> = ({ data }) => {
  return {
    title: `Remastered: ${data.title}`,
  };
};
