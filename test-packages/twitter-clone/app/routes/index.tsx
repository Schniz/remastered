import type { Tweet, User } from "@prisma/client";
import { getSession, getUser } from "../session";
import React from "react";
import { Link, LoaderFn, useRouteData } from "remastered";
import { prisma } from "../db";

type Data = {
  tweets: Array<
    Tweet & {
      user: Pick<User, "id" | "display_name">;
    }
  >;
  currentUser: User | null;
  notice?: string;
};

export const loader: LoaderFn<Data> = async ({ request }) => {
  const session = await getSession(request);
  const notice = session.get("notice");
  const currentUser = await getUser(request);

  return {
    ...(typeof notice === "string" ? { notice } : {}),
    currentUser,
    tweets: await prisma.tweet.findMany({
      take: 20,
      orderBy: {
        created_at: "desc",
      },
      include: {
        user: {
          select: { id: true, display_name: true },
        },
      },
    }),
  };
};

export default function Home() {
  const routeData = useRouteData<Data>();
  return (
    <>
      <h1 className="font-bold">
        Latest Tweets
        {routeData.currentUser && (
          <> for {routeData.currentUser.display_name}</>
        )}
      </h1>
      {routeData.notice && (
        <div className="font-bold text-red-500">{routeData.notice}</div>
      )}
      <ul className="py-4 space-y-4">
        {routeData.tweets.map((tweet) => {
          return (
            <li key={tweet.id}>
              <Link to={`users/${tweet.user.id}/tweets/${tweet.id}`}>
                <blockquote>{tweet.text}</blockquote>
                <span>
                  -- {tweet.user.display_name} at{" "}
                  {new Date(tweet.created_at).toISOString()}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}
