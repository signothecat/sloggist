// components/Main.js
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

export default function Main({ children, slug }) {
  const router = useRouter();
  const [channels, setChannels] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Fetch ---
  const fetchChannels = useCallback(async () => {
    const res = await fetch("/api/channels", { cache: "no-store" });
    const data = await res.json();
    setChannels(data);
  }, []);

  const fetchLogs = useCallback(async () => {
    if (!slug) {
      setLogs([]); // Logをなしに
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/channels/${slug}/logs`, { cache: "no-store" });
      const data = await res.json();
      setLogs(data); // 取得したLogを反映
    } finally {
      setLoading(false);
    }
  }, [slug]);

  // --- Initial Load & Dependency Changes ---
  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);
  useEffect(() => {
    setLogs([]); // 表示されているログをクリア
    fetchLogs(); // チャンネルのログを取得
  }, [fetchLogs]);

  // --- Actions ---
  const onSelectChannel = nextSlug => {
    router.push(`/channel/${nextSlug}`, undefined, { shallow: true });
  };

  const onAddChannel = async name => {
    const res = await fetch("/api/channels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    const newChannel = await res.json();
    setChannels(prev => [...(prev || []), newChannel]);
    // 追加後に遷移
    router.push(`/channel/${newChannel.slug}`, undefined, { shallow: true });
  };

  const onSend = async text => {
    if (!slug || !text?.trim()) return;
    await fetch(`/api/channels/${slug}/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text.trim() })
    });
    // 再取得
    fetchLogs();
  };

  // --- render-props ---
  return children({
    channels,
    logs,
    loading,
    onSelectChannel,
    onAddChannel,
    onSend
  });

  // メモ: children(ctrl); の結果は以下のようになる。
  // <AppLayout {...ctrl}>
  //   <Component {...pageProps} slug={slug} />
  // </AppLayout>
  //
  // なぜなら、
  // children = ctrl => {
  //   <AppLayout {...ctrl} slug={slug}>
  //     <Component {...pageProps} slug={slug} logs={ctrl.logs} loading={ctrl.loading} />
  //   </AppLayout>
  // }
}
