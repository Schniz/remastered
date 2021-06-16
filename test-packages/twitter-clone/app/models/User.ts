import type { User } from "@prisma/client";
import { prisma } from "../db";
import bcrypt from "bcryptjs";

export async function logIn(
  email: string,
  password: string
): Promise<User | null> {
  const user = await prisma.user.findUnique({ where: { email } });

  if (user?.hashed_password) {
    const allowed = await bcrypt.compare(password, user.hashed_password);
    if (allowed) {
      return user;
    }
  }

  return null;
}

export async function signUp(details: {
  email: string;
  plaintextPassword: string;
  displayName: string;
}): Promise<User> {
  const hashedPassword = await bcrypt.hash(details.plaintextPassword, 10);
  const user = await prisma.user.create({
    data: {
      display_name: details.displayName,
      email: details.email.toLowerCase(),
      hashed_password: hashedPassword,
    },
  });
  return user;
}
