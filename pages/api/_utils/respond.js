// pages/api/_utils/respond.js
// apiでのみ使う
import { randomUUID } from "crypto";

export async function respond(req, res, handler) {
  const reqId = randomUUID(); // 相関ID
  try {
    await handler(); // APIの本体
  } catch (err) {
    // === 内部用ログ（ユーザーには見えない） ===
    console.error("[API Error]", {
      reqId,
      path: req.url,
      status: err?.status || 500,
      code: err?.code || null,
      message: err?.message,
      meta: err?.meta
    });

    // === 外部用（ユーザーも見えるので詳細は出さない） ===
    if (err?.status) {
      // statusあり
      res.setHeader("X-Request-ID", reqId); // 内部照会用
      return res.status(err.status).json({ error: "Not Found" }); // たとえば403でも404で返す
    }
    // statusなし
    res.setHeader("X-Request-ID", reqId);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
