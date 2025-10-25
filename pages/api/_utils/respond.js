// pages/api/_utils/respond.js
// apiでのみ使う
import { toClientError } from "@/lib/errors";
import { randomUUID } from "node:crypto";

export const respond = async (req, res, handler) => {
  const reqId = randomUUID(); // 相関id
  res.setHeader("Request-ID", reqId);

  try {
    // api本体を実行
    const result = await handler();

    // handlerが自分でresを書き出していた場合、return
    if (res.headersSent) return;

    // nullおよびundefinedなら、nullに(client側のjson()エラー回避のため)
    if (result === undefined || result === null) {
      return res.status(200).json(null);
    }

    return res.status(200).json(result);
  } catch (err) {
    // handlerが自分でresを書き出していた場合（部分書き出し後の例外など）、return
    if (res.headersSent) return;

    // 内部ログ（詳細）
    console.error("[API Error]", {
      reqId,
      method: req.method,
      path: req.url,
      status: err?.status ?? 500,
      code: err?.code ?? null,
      publicMessage: err?.publicMessage ?? null,
      internalMessage: err?.internalMessage ?? null,
      meta: err?.meta ?? null,
      stack: err?.stack,
      cause: err?.cause && {
        name: err.cause.name,
        message: err.cause.message,
        stack: err.cause.stack,
      },
    });

    // クライアント用ログ（安全）
    const clientError = toClientError(err, reqId); // ClientError型
    return res.status(clientError.error.status).json(clientError);
  }
};
