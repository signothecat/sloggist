// pages/api/channels/[slug]/logs.js
import { getTokenCookie } from "@/lib/cookies";
import { prisma } from "@/lib/prisma";
import { bootstrapChannelContext } from "@/lib/services/bootstrap";

export default async function handler(req, res) {
  try {
    // --- 認証 + チャンネル解決 (user スコープ内で slug を解決する) ---

    // token：Cookieを探して入れる
    const token = getTokenCookie(req) ?? null;

    // slug：router.queryから入れる
    const rawSlug = req.query?.slug; // router.queryからslugを取り出す
    const slug = typeof rawSlug === "string" ? rawSlug : rawSlug?.[0]; // slugに入れる（rawSlugが配列なら最初の項目を取得）

    // tokenとslugを使い、user.idにおけるuserスコープ内でslugを解決する
    const { user, channel } = await bootstrapChannelContext({ token, slug });

    // --- GET：ログの一覧（配列）を返す ---
    if (req.method === "GET") {
      const logs = await prisma.log.findMany({
        where: { channelId: channel.id },
        orderBy: { createdAt: "desc" },
        select: { id: true, content: true, createdAt: true }
      });
      return res.status(200).json(logs);
    }

    // --- POST：ログを作成 ---
    if (req.method === "POST") {
      // 文字列ならrawに入れる
      const raw = typeof req.body?.content === "string" ? req.body.content : "";
      // 空白文字のみの場合、エラーを返す
      if (!/\S/.test(raw)) {
        return res.status(400).json({ error: "content is required" });
      }
      // 文字数上限を超過している場合、エラーを返す
      if (raw.length > 10_000) {
        return res.status(413).json({ error: "content is too long" });
      }
      // 改行の正規化
      const formatted = raw.replace(/\r\n/g, "\n");

      await prisma.log.create({
        data: { content: formatted, channelId: channel.id, userId: user.id },
        select: { id: true } // 返り値は今のところ使わないので一旦idのみ選択
      });

      // クライアント側は <Main> の指示で直後に fetchLogs() で再取得するため、最小レスポンス
      return res.status(201).json({ ok: true });
    }

    // --- 未対応のmethodが来た場合 ---
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (err) {
    // --- その他のエラー ---
    console.error("[/api/channels/[slug]/logs.js] Error", {
      name: err?.name,
      code: err?.code,
      message: err?.message,
      meta: err?.meta
    });
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
