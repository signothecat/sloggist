// pages/api/me.js
import { getTokenCookie } from "@/lib/cookies";
import { getUserFromToken } from "@/lib/user/getUserFromToken";
import { respond } from "@/pages/api/_utils/respond";

export default async function handler(req, res) {
  await respond(req, res, async () => {
    const token = getTokenCookie(req) ?? null;
    const user = await getUserFromToken({ token }); // 副作用なし

    // 見つからなかった場合
    if (!user) return res.status(200).json({ authenticated: false, user: null });

    // 見つかった場合
    return res.status(200).json({
      authenticated: true,
      user: { username: user.username ?? null, handle: user.handle ?? null } // 安全な情報のみ
    });
  });
}
