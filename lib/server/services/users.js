// lib/server/services/users.js
import { prisma } from "@/lib/server/prisma";
import { getUserFromToken, SERVER_USER_SELECT } from "@/lib/server/user/getUserFromToken";
import { HttpError } from "@/lib/shared/errors";

// tokenに対してuserがnullなら外側にエラーを投げて処理中断
export async function requireUser({ token, tx = prisma }) {
  const user = await getUserFromToken({ token, tx }); // user || null
  if (!user)
    throw new HttpError(401, "Unauthorized", {
      code: "UNAUTHORIZED",
      meta: { tokenPresent: Boolean(token) }
    });
  return user; // at SERVER_USER_SELECT
}

// userを探して返すが、見つからなければ作成して返す、userの存在を保証する。副作用あり
// bootstrapUserでのみ呼ばれている（index.jsでのみ呼ばれている）
export async function getOrCreateUser({ token, tx = prisma }) {
  const found = await getUserFromToken({ token, tx });
  if (found) return { user: found, created: false };

  const user = await tx.user.create({
    // 見つからなければ新規作成
    data: { username: `user-${Math.random().toString(36).slice(2, 8)}` },
    select: SERVER_USER_SELECT
  });

  return { user, created: true };
}
