// services/users/requireUser.js
import { HttpError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { getUserFromToken } from "@/services/users/getUserFromToken";

// tokenに対してuserがnullなら外側にエラーを投げて処理中断
export const requireUser = async ({ token, tx = prisma }) => {
  const user = await getUserFromToken({ token, tx }); // user || null

  if (!user) {
    throw new HttpError(401, "User authentication is required", {
      code: "USER_AUTH_REQUIRED",
      internalMessage: "requireUser called without valid user (token invalid or missing)",
      meta: { tokenPresent: Boolean(token) },
    });
  }

  return user; // at SERVER_USER_SELECT
};
