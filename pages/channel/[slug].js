// pages/channel/[slug].js
import ChannelPane from "@/components/channel/ChannelPane";
import { getTokenCookie } from "@/lib/cookies";

export default function ChannelPage({ slug, view }) {
  return <ChannelPane slug={slug} view={view} />;
}

export async function getServerSideProps({ req }) {
  const token = getTokenCookie(req) ?? null;

  // tokenがなければルートにリダイレクトする
  if (!token) {
    return { redirect: { destination: "/", permanent: false } };
  }

  return { props: {} };
}
