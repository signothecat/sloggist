// services/users/getUserFromToken.js
// 副作用なし、tokenでDBを探して見つけたuserを返す、見つからなければnullを返す
import { prisma } from "@/lib/prisma";

export const SERVER_USER_SELECT = {
  id: true,
  token: true,
  username: true,
  handle: true,
  avatar: true,
};

export const getUserFromToken = async ({ token, tx = prisma }) => {
  if (!token || token === "undefined" || token === "null") {
    return null;
  }

  return await tx.user.findUnique({
    where: { token },
    select: SERVER_USER_SELECT,
  });
};
