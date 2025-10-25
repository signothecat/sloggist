// services/channels/deleteChannel.js
import { HttpError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { requireUser } from "../users/requireUser";
import { getOwnedChannel } from "./getOwnedChannel";

export const deleteChannel = async ({ token, slug, tx = prisma }) => {
  const user = await requireUser({ token, tx }); // user | 401
  const channel = await getOwnedChannel({ userId: user.id, slug, tx }); // channel | 400 | 404

  if (channel.isHome) {
    throw new HttpError(409, "Cannot delete home channel", {
      code: "CANNOT_DELETE_HOME",
      meta: { slug },
    });
  }

  try {
    await tx.channel.delete({ where: { id: channel.id } });
  } catch (e) {
    throw new HttpError(500, "Internal Server Error", {
      code: "DB_ERROR",
      internalMessage: e?.message,
      meta: { operation: "channel.delete", slug, channelId: channel.id },
      cause: e,
    });
  }
};
