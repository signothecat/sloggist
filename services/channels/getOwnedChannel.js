// services/channels/getOwnedChannel.js
import { HttpError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

// userIdスコープでslugのchannelを探す関数
// getValidChannelで呼ばれる
export async function getOwnedChannel({ userId, slug, tx = prisma }) {
  // まずslugでchannelを探す
  const targetChannel = await tx.channel.findUnique({
    where: { slug },
    select: { id: true, slug: true, name: true, isHome: true, userId: true },
  });

  // slugでchannelが見つからない場合
  if (!targetChannel) {
    throw new HttpError(404, "Channel not found", {
      code: "CHANNEL_NOT_FOUND",
      meta: { slug },
    });
  }

  // channelが見つかったが、userにアクセス権がない場合
  if (targetChannel.userId !== userId) {
    throw new HttpError(404, "Channel forbidden", {
      code: "CHANNEL_FORBIDDEN",
      meta: { slug, requestedBy: userId },
      expose: false,
    });
  }

  const { userId: _omit, ...safe } = targetChannel; // userId（DBの主キー）は棄却、それ以外をsafeに
  return safe;
}
