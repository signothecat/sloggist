// pages/index.js

export async function getServerSideProps({ req, res }) {
  const [{ bootstrapUser }, { getTokenCookie, setTokenCookie }] = await Promise.all([
    import("@/lib/server/actions/bootstrapUser"),
    import("@/lib/server/cookies"),
  ]);

  // Cookieにtokenなし / token: 非文字列 / token: "undefined" などの場合、nullにする
  const safeToken = t => (typeof t === "string" && t !== "undefined" && t !== "null" && t !== "" ? t : null);

  const cookieToken = safeToken(getTokenCookie(req));

  const { user, homeSlug } = await bootstrapUser({ token: cookieToken }); // ユーザー作成 & Home作成
  if (!cookieToken) setTokenCookie(res, user.token); // Cookieにtokenをセット

  return {
    redirect: { destination: `/channel/${homeSlug}`, permanent: false },
  };
}

export default function _() {
  return null;
}
