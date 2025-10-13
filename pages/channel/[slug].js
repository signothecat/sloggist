// pages/channel/[slug].js
import ChannelPane from "@/components/channel/ChannelPane";
import { getTokenCookie } from "@/lib/cookies";

export default function ChannelPage() {
  return <ChannelPane />;
}

export async function getServerSideProps({ req }) {
  const token = getTokenCookie(req) ?? null;
  if (!token) {
    return { redirect: { destination: "/", permanent: false } }; // tokenがなければリダイレクト
  }

  return { props: {} };
}
