import { User } from "@prisma/client";
import React from "react";
import { LoaderFn, useRouteData } from "remastered";
import { prisma } from "../../db";

type Data = {
  user: { displayName: User["display_name"] };
};
export const loader: LoaderFn<Data> = async ({ params }) => {
  const user = await prisma.user.findUnique({
    where: {
      username: params.userId.toLowerCase(),
    },
  });

  if (!user) return null;

  return {
    user: { displayName: user.display_name },
  };
};

export default function UserHome() {
  const routeData = useRouteData<Data>();
  return (
    <div>
      <h1>User {routeData.user.displayName}!</h1>
      <p>Welcome</p>
    </div>
  );
}
