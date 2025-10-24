// pages/channel/[slug].js
import ChannelPane from "@/components/channel/ChannelPane";

export default function ChannelPage() {
  return <ChannelPane />;
}

export async function getServerSideProps(ctx) {
  const { req, params } = ctx;
  const [{ getTokenCookie }, { getValidChannel }, { prisma }] = await Promise.all([
    import("@/lib/server/cookies"),
    import("@/lib/server/actions/getValidChannel"),
    import("@/lib/server/prisma"),
  ]);

  // ==============================
  // Cookieのuser_token確認
  // ==============================

  const token = getTokenCookie(req) ?? null;
  // tokenがなければトップへ
  if (!token) return { redirect: { destination: "/", permanent: false } };

  // ==============================
  // URL(slug)検証
  // ==============================

  const slug = typeof params?.slug === "string" ? params.slug : params?.slug?.[0];

  try {
    await getValidChannel({ token, slug }); // user,channelが返るか、400/401/404が返る
    return { props: {} }; // エラーでなければそのまま表示
  } catch (e) {
    const status = e?.status ?? 500;

    // 401(認証切れ)はトップへ
    if (status === 401) return { redirect: { destination: "/", permanent: false } };

    // 400と404はHomeチャンネルへ
    // (400: Invalid slug, 404: Channel not found もしくは Channel forbidden)
    if (status === 400 || status === 404) {
      // userのHomeを引いてslugを得る（ensure済みのはずだが念のため）
      const user = await prisma.user.findUnique({
        where: { token },
        select: { id: true, home: { select: { slug: true } } },
      });
      const homeSlug =
        user?.home?.slug ?? (await prisma.channel.findFirst({ where: { userId: user?.id, isHome: true }, select: { slug: true } }))?.slug ?? ""; // 最後の保険

      const dest = homeSlug ? `/channel/${homeSlug}` : "/";
      return { redirect: { destination: dest, permanent: false } };
    }

    // その他は一旦トップへ
    return { redirect: { destination: "/", permanent: false } };
  }
}
