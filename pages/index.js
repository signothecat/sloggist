// pages/index.js
import { bootstrapUser } from "@/actions/bootstrapUser";
import { getTokenCookie, setTokenCookie } from "@/lib/cookies";

export async function getServerSideProps({ req, res }) {
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
