// pages/channel/[slug].js
import ChannelPane from "@/components/channel/ChannelPane";
import { useRouter } from "next/router";

export default function ChannelPage() {
  const router = useRouter();
  const { slug: channelSlug } = router.query;

  return <ChannelPane channelSlug={channelSlug} />;
}
