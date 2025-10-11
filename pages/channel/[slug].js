// pages/channel/[slug].js
import ChannelPane from "@/components/channel/ChannelPane";

export default function ChannelPage({ slug, logs, loading }) {
  return <ChannelPane slug={slug} logs={logs} loading={loading} />;
}
