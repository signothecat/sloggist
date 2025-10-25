// lib/errors.js

const STATUS_TEXT = Object.freeze({
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not Found",
  405: "Method Not Allowed",
  409: "Conflict",
  413: "Payload Too Large",
  500: "Internal Server Error",
});

export class HttpError extends Error {
  // statusのみ必須
  constructor(status, publicMessage, { internalMessage, code, meta, cause } = {}) {
    super(publicMessage, { cause }); // 親クラスに渡す

    this.name = "HttpError";
    this.status = status; // httpステータスコード
    this.publicMessage = publicMessage; // 公開用メッセージ
    this.internalMessage = internalMessage; // 内部用メッセージ
    this.code = code ?? null; // エラーのタイトル("CHANNEL_FORBIDDEN"など)
    this.meta = meta ?? null; // 詳細情報
  }
}

// api層で使用
export const toClientError = (err, reqId) => {
  const isHttpError = err instanceof HttpError;

  const status = isHttpError && Number.isFinite(err.status) ? err.status : 500;
  const message = isHttpError ? err.publicMessage : STATUS_TEXT[500];

  return {
    ok: false,
    error: { status, message, requestId: reqId || null },
  };
};
