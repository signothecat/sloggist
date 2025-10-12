// pages/channel/[slug].js
import ChannelPane from "@/components/channel/ChannelPane";

export default function ChannelPage({ slug, view }) {
  return <ChannelPane slug={slug} view={view} />;
}
