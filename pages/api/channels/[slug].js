// pages/api/channels/[slug].js
import { HttpError } from "@/lib/errors";
import { respond } from "@/pages/api/_utils/respond";
import { deleteChannel } from "@/services/channels/deleteChannel";
import { getTokenCookie } from "@/services/http/cookies";

export default async function handler(req, res) {
  await respond(req, res, async () => {
    if (req.method !== "DELETE") {
      res.setHeader("Allow", ["DELETE"]); // 今はdeleteのみ
      throw new HttpError(405, "Something went wrong", {
        code: "METHOD_NOT_ALLOWED",
        internalMessage: `channel API called with unsupported method: ${req.method}`,
      });
    }

    const token = getTokenCookie(req) ?? null;
    const rawSlug = req.query?.slug;
    const slug = typeof rawSlug === "string" ? rawSlug : rawSlug?.[0];

    if (req.method === "DELETE") {
      // (後々のために分岐)
      await deleteChannel({ token, slug });
      return res.status(204).end();
    }

    // TBA: PATCH (rename)
    // if (req.method === "...") {...}

    // TBA(if needed): GET (単体取得）
    // if (req.method === "GET") {...}
  });
}
