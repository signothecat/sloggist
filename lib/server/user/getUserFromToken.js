// lib/server/user/getUserFromToken.js
// 副作用なし、tokenでDBを探して見つけたuserを返す、見つからなければnullを返す
import { prisma } from "@/lib/server/prisma";

export const SERVER_USER_SELECT = {
  id: true,
  username: true,
  handle: true
};

export async function getUserFromToken({ token, tx = prisma }) {
  if (!token) return null;
  return await tx.user.findUnique({
    where: { token },
    select: SERVER_USER_SELECT
  });
}
