// services/users/ensureUser.js
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/services/users/getUserFromToken";

// userを探して返すが、見つからなければ作成して返す、userの存在を保証する。副作用あり
// bootstrapUserでのみ（index.jsでのみ）呼ばれる
export const ensureUser = async ({ token, tx = prisma }) => {
  const found = await getUserFromToken({ token, tx });
  if (found) return { user: found, created: false };

  const user = await tx.user.create({
    // 見つからなければ新規作成
    data: { username: `user-${Math.random().toString(36).slice(2, 8)}` },
    select: { id: true, username: true, handle: true, token: true }, // tokenを含める
  });

  return { user, created: true };
};
