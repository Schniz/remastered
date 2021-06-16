import { redirectBack } from "../../../../redirectBack";
import { ActionFn, redirectTo } from "remastered";
import { prisma } from "../../../../db";
import { getSession, getUser } from "../../../../session";

export const action: ActionFn = async ({ request }) => {
  const session = await getSession(request);
  const user = await getUser(request);

  if (!user) {
    session.flash("error", "Please sign in to continue.");
    return redirectTo("/sessions/new", {
      headers: {
        "Set-Cookie": await session.commit(),
      },
    });
  }

  const data = new URLSearchParams(await request.text());
  const text = data.get("text")?.trim();

  if (!text?.length) {
    session.flash("notice", "No message! please write more message!");
    return redirectBack(request, {
      fallback: "/",
      headers: { "Set-Cookie": await session.commit() },
    });
  }

  await prisma.tweet.create({
    data: {
      text,
      userId: user.id,
    },
  });

  session.flash("notice", "Tweet sent successfuly.");

  return redirectBack(request, {
    fallback: `/`,
    headers: { "Set-Cookie": await session.commit() },
  });
};
