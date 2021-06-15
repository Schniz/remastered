import type { User } from "@prisma/client";
import { createSessionStore, createCookieSessionStorage } from "remastered";
import { HttpRequest } from "remastered/dist/HttpTypes";
import { prisma } from "./db";

export const getSession = createSessionStore(
  createCookieSessionStorage({
    cookie: {
      name: "_rmstrd_twttr",
      secret: "kitty",
    },
  })
);

const requestUsers = new WeakMap<HttpRequest, User | null>();
export const getUser = async (request: HttpRequest): Promise<User | null> => {
  if (requestUsers.has(request)) {
    return requestUsers.get(request) ?? null;
  }

  const session = await getSession(request);
  const userId = session.get("userId");
  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({ where: { id: Number(userId) } });
  requestUsers.set(request, user);
  return user;
};
