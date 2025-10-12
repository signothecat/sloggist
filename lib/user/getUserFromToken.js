// lib/user/getUserFromToken.js
// 副作用なし、tokenでDBを探して見つけたuserを返す、見つからなければnullを返す
import { prisma } from "@/lib/prisma";

export async function getUserFromToken({ token, tx = prisma }) {
  if (!token) return null;
  return await tx.user.findUnique({ where: { token } });
}
