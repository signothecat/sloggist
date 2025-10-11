// pages/api/channels/index.js
import { getTokenCookie } from "@/lib/cookies";
import { prisma } from "@/lib/prisma";
import { bootstrapUserContext } from "@/lib/services/bootstrap";

export default async function handler(req, res) {
  const maxNameLength = 40;

  try {
    // --- 認証 ---

    // token：Cookieを探して入れる
    const token = getTokenCookie(req) ?? null;

    // user：bootstrapUserContextが返したuserをconst userに入れる
    console.log("api/channelsからuserContext発火");
    const { user } = await bootstrapUserContext({ token: token });
    // 万が一userが存在しない、あるいはuser.idが見つからない場合
    if (!user?.id) {
      return res.status(401).json({ error: "User undefined" });
    }

    // --- GET：チャンネルの取得 ---
    if (req.method === "GET") {
      const channels = await prisma.channel.findMany({
        where: { userId: user.id },
        select: { id: true, name: true, slug: true },
        orderBy: { createdAt: "asc" }
      });
      // 成功
      return res.status(200).json(channels);
    }

    // --- POST：作成 ---
    if (req.method === "POST") {
      const { name } = req.body ?? {};

      // 名前が未入力なら失敗
      if (typeof name !== "string" || !(name = name.trim())) {
        return res.status(400).json({ error: "Name is required" });
      }
      // 文字数制限（仮運用）
      if (name.length > maxNameLength) {
        return res.status(400).json({ error: "Name cannot exceed 40 characters." });
      }

      try {
        const channel = await prisma.channel.create({
          data: {
            name,
            userId: user.id
          },
          select: { id: true, name: true, slug: true }
        });
        // 成功
        return res.status(201).json(channel);
      } catch (e) {
        // Prismaのunique制約との衝突
        if (e?.code === "P2002") {
          return res.status(409).json({ error: "Channel already exists" });
        }
        throw e; // それ以外は上へ投げる
      }
    }

    // --- 未対応のmethodが来た場合 ---
    res.setHeader("Allow", ["GET", "POST"]); // 現時点ではGETとPOSTのみなので
    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (e) {
    // --- その他のエラー ---
    console.error(e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
