// pages/index.js
import { getTokenCookie, setTokenCookie } from "@/lib/cookies";
import { bootstrapUserContext } from "@/lib/services/bootstrap";

export async function getServerSideProps({ req, res }) {
  // tokenのCookieを探して入れる
  const token = getTokenCookie(req) ?? null;

  // bootstrapUserContextの結果をuser, homeSlugに入れる
  const { user, homeSlug } = await bootstrapUserContext({
    token,
    createHome: true,
    seed: false
  });

  // tokenがなければbootstrapUserContextからもらったuser.tokenをセットする
  if (!token) {
    setTokenCookie(res, user.token);
  }

  return {
    redirect: {
      destination: `/channel/${homeSlug}`,
      permanent: false
    }
  };
}

export default function _() {
  return null;
}
