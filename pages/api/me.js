// pages/api/me.js
import { HttpError } from "@/lib/errors";
import { respond } from "@/pages/api/_utils/respond";
import { getTokenCookie } from "@/services/http/cookies";
import { getUserFromToken } from "@/services/users/getUserFromToken";

export default async function handler(req, res) {
  await respond(req, res, async () => {
    if (req.method !== "GET") {
      res.setHeader("Allow", ["GET"]);
      throw new HttpError(405, "Something went wrong", {
        code: "METHOD_NOT_ALLOWED",
        internalMessage: `me API called with unsupported method: ${req.method}`,
      });
    }

    const token = getTokenCookie(req) ?? null;
    const user = await getUserFromToken({ token }); // SERVER_USER_SELECTでuserを返す

    // 見つからなかった場合
    if (!user) {
      return { authenticated: false, user: null };
    }

    // 見つかった場合
    return {
      authenticated: true,
      user: {
        // 安全な情報のみ
        username: user.username ?? null,
        handle: user.handle ?? null,
        avatar: user.avatar ?? null,
      },
    };
  });
}
