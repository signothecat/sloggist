// pages/channel/[slug].js
import ChannelPane from "@/components/channel/ChannelPane";

export default function ChannelPage() {
  return <ChannelPane />;
}

export async function getServerSideProps({ req }) {
  const { getTokenCookie } = await import("@/lib/server/cookies");
  const token = getTokenCookie(req) ?? null;
  if (!token) {
    return { redirect: { destination: "/", permanent: false } }; // tokenがなければリダイレクト
  }

  return { props: {} };
}
