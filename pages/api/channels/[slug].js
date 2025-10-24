// pages/api/channels/[slug].js
import { getValidChannel } from "@/actions/getValidChannel";
import { HttpError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { respond } from "@/pages/api/_utils/respond";
import { getTokenCookie } from "@/services/http/cookies";

export default async function handler(req, res) {
  await respond(req, res, async () => {
    const token = getTokenCookie(req) ?? null;
    const rawSlug = req.query?.slug;
    const slug = typeof rawSlug === "string" ? rawSlug : rawSlug?.[0];

    if (req.method === "DELETE") {
      const { channel } = await getValidChannel({ token, slug });

      // homeなら却下
      if (channel.isHome) {
        throw new HttpError(409, "Cannot delete home channel", {
          code: "CANNOT_DELETE_HOME",
          meta: { slug },
        });
      }

      await prisma.channel.delete({ where: { id: channel.id } });
      return res.status(204).end();
    }

    // TBA: PATCH (rename)
    // TBA(if needed): GET (単体取得）

    res.setHeader("Allow", ["DELETE"]); // 今はdeleteのみ
    throw new HttpError(405, "Method Not Allowed", {
      code: "METHOD_NOT_ALLOWED",
      meta: { method: req.method },
    });
  });
}
