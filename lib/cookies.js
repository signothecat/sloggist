// lib/cookies.js
import * as cookie from "cookie";

/* Cookie名 */
const tokenName = "user_token"; // token

/* Options */
// token
const tokenCookieOptions = {
  path: "/",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 90
};

/* Cookieを取得 */
// token
export function getTokenCookie(req) {
  const parsed = cookie.parse(req?.headers?.cookie ?? "");
  return parsed[tokenName] ?? null;
}

/* Cookieをセット */
// token
export function setTokenCookie(res, token, overrideOptions = {}) {
  const serialized = cookie.serialize(tokenName, token, {
    ...tokenCookieOptions,
    ...overrideOptions
  });
  res.setHeader("Set-Cookie", serialized);
}

/* Cookieを削除 */
// token
export function clearTokenCookie(res) {
  setTokenCookie(res, "", { maxAge: 0 });
}
