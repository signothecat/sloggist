// services/channels/createChannel.js
import { HttpError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { SAFE_CHANNEL_SELECT, toChannelDisplay } from "./channelContract";

const MAX_NAME_LENGTH = 40;

export async function createChannel({ userId, rawName }) {
  if (!userId) {
    throw new HttpError(400, "User authentication is required", {
      code: "USER_ID_REQUIRED",
      internalMessage: "createChannel called without userId",
    });
  }

  const name = typeof rawName === "string" ? rawName.trim() : "";

  if (!name) {
    throw new HttpError(400, "New channel name is required", {
      code: "CHANNEL_NAME_REQUIRED",
    });
  }

  if (name.length > MAX_NAME_LENGTH) {
    throw new HttpError(400, `Name cannot exceed ${MAX_NAME_LENGTH} characters.`, {
      code: "CHANNEL_NAME_TOO_LONG",
      meta: { length: name.length, max: MAX_NAME_LENGTH },
    });
  }

  try {
    const created = await prisma.channel.create({
      data: { name, userId },
      select: SAFE_CHANNEL_SELECT,
    });
    return toChannelDisplay(created); // ChannelDisplay型
  } catch (e) {
    if (e?.code === "P2002") {
      // unique制約
      throw new HttpError(409, "Channel already exists", {
        code: "CHANNEL_ALREADY_EXISTS",
        meta: { target: e?.meta?.target ?? null, name },
        internalMessage: e.message,
        cause: e,
      });
    }
    // それ以外は500で上位へ
    throw new HttpError(500, "Internal Server Error", {
      code: "DB_ERROR",
      internalMessage: e?.message,
      meta: { operation: "channel.create", userId, name },
      cause: e,
    });
  }
}
