// pages/api/channels/[slug]/logs.js
import { getValidChannel } from "@/lib/server/actions/getValidChannel";
import { getTokenCookie } from "@/lib/server/cookies";
import { prisma } from "@/lib/server/prisma";
import { HttpError } from "@/lib/shared/errors";
import { respond } from "@/pages/api/_utils/respond";

export const SAFE_LOG_SELECT = {
  slug: true,
  content: true,
  createdAt: true,
};

export default async function handler(req, res) {
  await respond(req, res, async () => {
    const token = getTokenCookie(req) ?? null;
    const rawSlug = req.query?.slug; // router.queryからslugを取り出す
    const slug = typeof rawSlug === "string" ? rawSlug : rawSlug?.[0]; // slugに入れる（rawSlugが配列なら最初の項目を取得）

    const { user, channel } = await getValidChannel({ token, slug }); // user,channelが返るか、400/401/404が返る

    if (req.method === "GET") {
      const logs = await prisma.log.findMany({
        where: { channelId: channel.id },
        orderBy: { createdAt: "asc" },
        select: SAFE_LOG_SELECT,
      });
      return res.status(200).json(logs);
    }

    if (req.method === "POST") {
      const raw = typeof req.body?.content === "string" ? req.body.content : "";

      if (!/\S/.test(raw)) return res.status(400).json({ error: "content is required" });
      if (raw.length > 10000) return res.status(413).json({ error: "content is too long" });
      const formatted = raw.replace(/\r\n/g, "\n"); // 改行の正規化

      const created = await prisma.log.create({
        data: { content: formatted, channelId: channel.id, userId: user.id },
        select: SAFE_LOG_SELECT,
      });
      return res.status(201).json(created);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    throw new HttpError(405, "Method Not Allowed", {
      code: "METHOD_NOT_ALLOWED",
      meta: { method: req.method },
    });
  });
}
