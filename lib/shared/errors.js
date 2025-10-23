// lib/shared/errors.js
export class HttpError extends Error {
  constructor(status, message = "", opts = {}) {
    super(message || String(status));
    this.name = "HttpError";
    this.status = status; // 外部用: HTTP status code
    this.code = opts.code ?? null; // 内部用: エラーコード（例: "CHANNEL_FORBIDDEN", "CHANNEL_NOT_FOUND"）
    this.meta = opts.meta ?? null; // 内部用: 追加情報（slug, userId など）※個人情報は注意
    this.expose = opts.expose ?? false; // true: 公開, false: 非公開
  }
}
