// pages/api/channels/index.js
import { HttpError } from "@/lib/errors";
import { respond } from "@/pages/api/_utils/respond";
import { createChannel } from "@/services/channels/createChannel";
import { getChannelsByUser } from "@/services/channels/getChannelsByUser";
import { getTokenCookie } from "@/services/http/cookies";
import { requireUser } from "@/services/users/requireUser";

export default async function handler(req, res) {
  await respond(req, res, async () => {
    const token = getTokenCookie(req) ?? null;
    const user = await requireUser({ token }); // user|401

    if (req.method === "GET") {
      const channels = await getChannelsByUser({ userId: user.id }); // channels|400|500
      return channels;
    }

    if (req.method === "POST") {
      const channel = await createChannel({ userId: user.id, rawName: req.body?.name }); // channel|400|409|500
      return res.status(201).json(channel);
    }

    res.setHeader("Allow", ["GET", "POST"]);
    throw new HttpError(405, "Something went wrong", {
      code: "METHOD_NOT_ALLOWED",
      internalMessage: `channels API called with unsupported method: ${req.method}`,
    });
  });
}
