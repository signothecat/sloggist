// pages/api/channels/[slug]/logs.js
import { getTokenCookie } from "@/lib/cookies";
import { prisma } from "@/lib/prisma";
import { bootstrapUserContext } from "@/lib/services/bootstrap";

export default async function handler(req, res) {
  // [slug]を取得
  const { slug } = req.query;

  // tokenのCookieを探して入れる
  const token = getTokenCookie(req) ?? null;

  // bootstrapUserContextが返したuserをconst userに入れる
  const { user } = await bootstrapUserContext({ token: token });

  // slugでchannelを取得
  const channel = await prisma.channel.findFirst({
    where: {
      slug: slug,
      userId: user.id
    },
    select: { id: true }
  });

  // チャンネルが見つからなければエラーを返す
  if (!channel) {
    return res.status(404).json({ error: "Channel not found" });
  }

  // channel.idでlogを取得
  const logs = await prisma.log.findMany({
    where: { channelId: channel.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, content: true, createdAt: true }
  });

  // ログを返す
  return res.status(200).json(logs);
}
