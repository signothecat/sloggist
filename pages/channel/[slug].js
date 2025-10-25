// pages/channel/[slug].js
import ChannelPane from "@/components/channel/ChannelPane";

export default function ChannelPage() {
  return <ChannelPane />;
}

export const getServerSideProps = async ctx => {
  const { req, params } = ctx;
  const [{ getTokenCookie }, { getValidChannel }, { getHomeSlug }] = await Promise.all([
    import("@/services/http/cookies"),
    import("@/actions/getValidChannel"),
    import("@/services/users/getHomeSlug"),
  ]);

  // === auth ===

  const token = getTokenCookie(req) ?? null;
  if (!token) return { redirect: { destination: "/", permanent: false } }; // tokenがなければトップへ

  // === slug verification ===

  const slug = typeof params?.slug === "string" ? params.slug : params?.slug?.[0];

  try {
    await getValidChannel({ token, slug }); //  401 | 400 | 404

    // エラーでなければそのまま表示
    return { props: {} };
  } catch (e) {
    const status = e?.status ?? 500;

    // 401(認証切れ)はトップへ
    if (status === 401) {
      return { redirect: { destination: "/", permanent: false } };
    }

    // 400と404はHomeチャンネルへ
    if (status === 400 || status === 404) {
      const homeSlug = await getHomeSlug({ token });
      const dest = homeSlug ? `/channel/${homeSlug}` : "/";
      return { redirect: { destination: dest, permanent: false } };
    }

    // その他は一旦トップへ
    return { redirect: { destination: "/", permanent: false } };
  }
};
