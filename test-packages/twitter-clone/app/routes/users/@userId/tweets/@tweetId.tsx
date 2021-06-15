import { prisma } from "../../../../db";
import React from "react";
import { LoaderFn, useRouteData } from "remastered";
import { Tweet, User } from "@prisma/client";

type Data = Tweet & { user: Pick<User, "id" | "display_name"> };
export const loader: LoaderFn<Data> = async ({ params }) => {
  return prisma.tweet.findFirst({
    include: { user: { select: { id: true, display_name: true } } },
    where: {
      id: Number(params.tweetId),
      user: {
        id: Number(params.userId),
      },
    },
  });
};

export default function UserTweet() {
  const routeData = useRouteData<Data>();

  return (
    <>
      <h1>{routeData.user.display_name}'s Tweet</h1>
      <pre>{JSON.stringify(routeData, null, 2)}</pre>
    </>
  );
}
