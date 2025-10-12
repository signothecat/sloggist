// pages/api/channels/[slug]/logs.js
import { bootstrapChannel } from "@/actions/bootstrapChannel";
import { getTokenCookie } from "@/lib/cookies";
import { HttpError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { respond } from "@/pages/api/_utils/respond";

export default async function handler(req, res) {
  await respond(req, res, async () => {
    const token = getTokenCookie(req) ?? null;
    const rawSlug = req.query?.slug; // router.queryからslugを取り出す
    const slug = typeof rawSlug === "string" ? rawSlug : rawSlug?.[0]; // slugに入れる（rawSlugが配列なら最初の項目を取得）

    const { user, channel } = await bootstrapChannel({ token, slug });

    if (req.method === "GET") {
      const logs = await prisma.log.findMany({
        where: { channelId: channel.id },
        orderBy: { createdAt: "desc" },
        select: { id: true, content: true, createdAt: true }
      });
      return res.status(200).json(logs);
    }

    if (req.method === "POST") {
      const raw = typeof req.body?.content === "string" ? req.body.content : "";

      if (!/\S/.test(raw)) return res.status(400).json({ error: "content is required" });
      if (raw.length > 10000) return res.status(413).json({ error: "content is too long" });
      const formatted = raw.replace(/\r\n/g, "\n"); // 改行の正規化

      await prisma.log.create({
        data: { content: formatted, channelId: channel.id, userId: user.id },
        select: { id: true } // 返り値は今のところ使わないので一旦idのみ選択
      });
      return res.status(201).json({ ok: true });
    }

    res.setHeader("Allow", ["GET", "POST"]);
    throw new HttpError(405, "Method Not Allowed", {
      code: "METHOD_NOT_ALLOWED",
      meta: { method: req.method }
    });
  });
}
