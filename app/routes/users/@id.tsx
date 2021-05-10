import { Project } from ".prisma/client";
import React from "react";
import { useParams } from "react-router-dom";
import { useRouteData } from "../../../src/LoaderContext";
import type { LoaderFn } from "../../../src/routeTypes";
import { prisma } from "../../database";

export const loader: LoaderFn<Project> = async ({ params }) => {
  return prisma.project.findUnique({
    where: {
      slug: params.id,
    },
  });
};

export default function ViewUser() {
  const data = useRouteData<Project>();

  return <h1>{data.name}</h1>;
}
