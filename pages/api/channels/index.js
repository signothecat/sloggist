// pages/api/channels/index.js
import { getTokenCookie } from "@/lib/cookies";
import { prisma } from "@/lib/prisma";
import { bootstrapUserContext } from "@/lib/services/bootstrap";

export default async function handler(req, res) {
  // tokenのCookieを探して入れる
  const token = getTokenCookie(req) ?? null;

  // bootstrapUserContextが返したuserをconst userに入れる
  const { user } = await bootstrapUserContext({ token: token });

  // チャンネルの取得
  if (req.method === "GET") {
    const channels = await prisma.channel.findMany({
      where: { userId: user.id },
      select: { id: true, name: true, slug: true },
      orderBy: { createdAt: "asc" }
    });

    // 成功
    return res.status(200).json(channels);
  }

  // 作成
  if (req.method === "POST") {
    const { name } = req.body;

    // 名前が未入力なら失敗
    if (!name) return res.status(400).json({ error: "Name is required" });

    const channel = await prisma.channel.create({
      data: {
        name,
        userId: user.id
      },
      select: { id: true, name: true, slug: true }
    });

    // 成功
    return res.status(201).json(channel);
  }

  // 失敗(Method Not Allowed)
  res.status(405).end();
}
