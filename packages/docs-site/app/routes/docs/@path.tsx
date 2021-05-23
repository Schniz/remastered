import React from "react";
import { HeadersFn, LoaderFn, MetaFn, useRouteData } from "remastered";
import { Doc, readDocFile } from "../../readDocFile";

export const loader: LoaderFn<Doc> = async ({ params }) => {
  return readDocFile(params.path);
};

export const headers: HeadersFn = async () => {
  return {
    ...(!__DEV__ && {
      "Cache-Control":
        "public, s-max-age=3600, must-revalidate, stale-while-revalidate=31536000",
    }),
  };
};

export default function DocPath() {
  const routeData = useRouteData<Doc>();
  return (
    <>
      <h1 className="px-2 py-4 text-xl font-bold text-black text-opacity-90">
        {routeData.title}
      </h1>
      <div
        className="w-screen px-2 prose"
        dangerouslySetInnerHTML={{ __html: routeData.content }}
      />
    </>
  );
}

export const meta: MetaFn<Doc> = ({ data }) => {
  return {
    title: `Remastered: ${data.title}`,
    ...(data.description && {
      description: `${data.description
        .trim()
        .replace(/\.$/, "")}. Learn more about Remastered!`,
    }),
  };
};
