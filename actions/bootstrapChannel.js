// actions/bootstrapChannel.js
import { getOwnedChannel } from "@/lib/channel/query";
import { HttpError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/services/users";

// slugでchannelを返し、userとchannelを返す
export async function bootstrapChannel({ token, slug }) {
  // slugの形式が正しくなければerrorを返す
  if (typeof slug !== "string" || !slug) {
    throw new HttpError(400, "Invalid slug", {
      code: "INVALID_SLUG"
    });
  }

  return prisma.$transaction(async tx => {
    const user = await requireUser({ token, tx }); // tokenでuserが見つからなければ401エラーで中断
    const channel = await getOwnedChannel({ userId: user.id, slug, tx }); // channelが見つからなければ404
    return { user, channel };
  });
}
