// pages/index.js

export async function getServerSideProps({ req, res }) {
  const [{ bootstrapUser }, { getTokenCookie, setTokenCookie }] = await Promise.all([
    import("@/lib/server/actions/bootstrapUser"),
    import("@/lib/server/cookies")
  ]);

  const token = getTokenCookie(req) ?? null;
  const { user, homeSlug } = await bootstrapUser({ token }); // ユーザー作成 & Home作成
  if (!token) setTokenCookie(res, user.token); // Cookieにtokenをセット

  return {
    redirect: { destination: `/channel/${homeSlug}`, permanent: false }
  };
}

export default function _() {
  return null;
}
