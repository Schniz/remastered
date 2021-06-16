import type { Tweet, User } from "@prisma/client";
import { getSession, getUser } from "../session";
import React from "react";
import { Link, LoaderFn, useRouteData } from "remastered";
import { prisma } from "../db";
import { useHref } from "react-router";

type Data = {
  tweets: Array<
    Tweet & {
      user: Pick<User, "username" | "display_name">;
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
          select: { username: true, display_name: true },
        },
      },
    }),
  };
};

export default function Home() {
  const routeData = useRouteData<Data>();
  return (
    <div>
      {routeData.currentUser ? (
        <div>
          <span className="block">Speak your mind</span>
          <form
            action={useHref(`@${routeData.currentUser.username}/new`)}
            method="post"
          >
            <textarea
              placeholder="... I'm thinking about ..."
              name="text"
            ></textarea>
            <button type="submit">Submit</button>
          </form>
        </div>
      ) : (
        <div>
          You are not logged in. <Link to="sessions/new">Log in</Link> or{" "}
          <Link to="users/new">Sign up</Link>
        </div>
      )}
      <h1 className="font-bold">Latest Tweets</h1>
      {routeData.notice && (
        <div className="font-bold text-red-500">{routeData.notice}</div>
      )}
      {routeData.tweets.length === 0 ? (
        <div>No tweets yet. Be the first!</div>
      ) : (
        <ul className="py-4 space-y-4">
          {routeData.tweets.map((tweet) => {
            return (
              <li key={tweet.id}>
                <Link to={`@${tweet.user.username}/${tweet.id}`}>
                  <blockquote>{tweet.text}</blockquote>
                  <span>
                    -- {tweet.user.display_name} at{" "}
                    {tweet.created_at.toISOString()}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
