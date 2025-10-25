// services/channels/getOwnedChannel.js
import { HttpError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

// slugでchannelを探し、userIdのuserがアクセス可能ならchannelを返す
// getValidChannelで呼ばれる
export const getOwnedChannel = async ({ userId, slug, tx = prisma }) => {
  if (!userId) {
    throw new HttpError(400, "Something went wrong", {
      code: "USER_ID_REQUIRED",
      internalMessage: "getOwnedChannel called without userId",
      meta: { slug },
    });
  }
  if (typeof slug !== "string" || !slug.trim()) {
    throw new HttpError(400, "Something went wrong", {
      code: "INVALID_SLUG",
      internalMessage: "getOwnedChannel called with invalid slug",
    });
  }

  try {
    // slugでchannelを探す
    const targetChannel = await tx.channel.findUnique({
      where: { slug },
      select: { id: true, slug: true, name: true, isHome: true, userId: true },
    });

    // slugでchannelが見つからない場合
    if (!targetChannel) {
      throw new HttpError(404, "Channel not found", {
        code: "CHANNEL_NOT_FOUND",
        internalMessage: "No channel found for given slug",
        meta: { slug },
      });
    }

    // channelが見つかったが、userにアクセス権がない場合
    // 本来は403だが、外部向けに404にする
    if (targetChannel.userId !== userId) {
      throw new HttpError(404, "Channel not found", {
        code: "CHANNEL_NOT_OWNED",
        internalMessage: `User ${userId} tried to access channel ${slug} owned by ${targetChannel.userId}`,
        meta: { slug, requestedBy: userId },
      });
    }

    const { userId: _omit, ...safe } = targetChannel; // userId以外をsafeに
    return safe;
  } catch (e) {
    // 下位からHttpErrorが投げられていれば、そのまま上位へ投げる
    if (e instanceof HttpError) throw e;

    throw new HttpError(500, "Internal Server Error", {
      code: "DB_ERROR",
      internalMessage: e?.message,
      meta: { operation: "channel.findUnique", userId, slug },
      cause: e,
    });
  }
};
