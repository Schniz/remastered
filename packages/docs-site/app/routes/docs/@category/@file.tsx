import React from "react";
import { HeadersFn, LoaderFn, MetaFn, useRouteData } from "remastered";
import { Doc, readDocFile } from "../../../readDocFile";
import { ogMeta } from "../../../ogMeta";
import { useNavigate } from "react-router";
import { useCatchLinks } from "../../../catchLinks";

type Data = Doc;

export const loader: LoaderFn<Data> = async ({ params }) => {
  const path = `${params.category}/${params.file}`;
  const doc = await readDocFile(path);
  return doc;
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
  const routeData = useRouteData<Data>();
  const navigate = useNavigate();
  const docRef = React.useRef<HTMLDivElement>(null);
  useCatchLinks(docRef, (url) => {
    navigate(url);
  });

  return (
    <>
      <h1 className="px-2 py-4 text-xl font-bold text-black text-opacity-90">
        {routeData.title}
      </h1>
      <div
        ref={docRef}
        className="w-screen px-2 md:w-full prose"
        dangerouslySetInnerHTML={{ __html: routeData.content }}
      />
    </>
  );
}

export const meta: MetaFn<Data> = ({ data }) => {
  return {
    ...ogMeta({
      title: `Remastered: ${data.title}`,
      description:
        data.description &&
        `${data.description
          .trim()
          .replace(/\.$/, "")}. Learn more about Remastered!`,
    }),
  };
};
