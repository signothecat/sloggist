// pages/index.js

export async function getServerSideProps({ req, res }) {
  const [{ bootstrapUser }, { getTokenCookie, setTokenCookie }] = await Promise.all([
    import("@/lib/server/actions/bootstrapUser"),
    import("@/lib/server/cookies"),
  ]);

  // Cookieにtokenなし / token: 非文字列 / token: "undefined" などの場合、nullにする
  const safeToken = t => (typeof t === "string" && t !== "undefined" && t !== "null" && t !== "" ? t : null);
  const cookieToken = safeToken(getTokenCookie(req));

  const { user, homeSlug, created } = await bootstrapUser({ token: cookieToken }); // ユーザー作成 & Home作成

  if (!cookieToken || created?.user === true || user.token !== cookieToken) {
    // 1) Cookieにtokenがない場合、2) ユーザーが新規作成された場合、3) CookieのtokenがDBのuser.tokenと異なる場合(2に進むはずだが念のため)
    setTokenCookie(res, user.token); // Cookieにtokenをセット
  }

  return {
    redirect: { destination: `/channel/${homeSlug}`, permanent: false },
  };
}

export default function _() {
  return null;
}
