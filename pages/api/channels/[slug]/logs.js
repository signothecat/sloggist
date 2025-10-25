// pages/api/channels/[slug]/logs.js
import { HttpError } from "@/lib/errors";
import { respond } from "@/pages/api/_utils/respond";
import { getOwnedChannel } from "@/services/channels/getOwnedChannel";
import { getTokenCookie } from "@/services/http/cookies";
import { createLog } from "@/services/logs/createLog";
import { getLogsByChannel } from "@/services/logs/getLogsByChannel";
import { requireUser } from "@/services/users/requireUser";

export default async function handler(req, res) {
  await respond(req, res, async () => {
    if (req.method !== "GET" && req.method !== "POST") {
      res.setHeader("Allow", ["GET", "POST"]);
      throw new HttpError(405, "Something went wrong", {
        code: "METHOD_NOT_ALLOWED",
        internalMessage: `logs API called with unsupported method: ${req.method}`,
      });
    }

    const token = getTokenCookie(req) ?? null;
    const rawSlug = req.query?.slug; // router.queryからslugを取り出す
    const slug = typeof rawSlug === "string" ? rawSlug : rawSlug?.[0]; // slugに入れる（rawSlugが配列なら最初の項目を取得）
    const user = await requireUser({ token }); // user | 401
    const channel = await getOwnedChannel({ userId: user.id, slug }); // channel | 400 | 404

    if (req.method === "GET") {
      const logs = await getLogsByChannel({ channelId: channel.id });
      return logs;
    }

    if (req.method === "POST") {
      const log = await createLog({ userId: user.id, channelId: channel.id, rawContent: req.body?.content });
      return res.status(201).json(log);
    }
  });
}
