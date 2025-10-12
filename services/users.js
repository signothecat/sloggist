// services/users.js
import { HttpError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/lib/user/getUserFromToken";

// tokenに対してuserがnullなら外側にエラーを投げて処理中断
export async function requireUser({ token, tx = prisma }) {
  const user = await getUserFromToken({ token, tx }); // user || null
  if (!user)
    throw new HttpError(401, "Unauthorized", {
      code: "UNAUTHORIZED",
      meta: { tokenPresent: Boolean(token) }
    });
  return user;
}

// userを探して返すが、見つからなければ作成して返す、userの存在を保証する。副作用あり
// bootstrapUserでのみ呼ばれている（index.jsでのみ呼ばれている）
export async function getOrCreateUser({ token, tx = prisma }) {
  const found = await getUserFromToken({ token, tx });
  if (found) return { user: found, created: false };

  const user = await tx.user.create({
    // 見つからなければ新規作成
    data: { username: `user-${Math.random().toString(36).slice(2, 8)}` }
  });
  return { user, created: true };
}
