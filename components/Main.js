// components/Main.js
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function Main({ children, slug }) {
  const router = useRouter();
  const [channels, setChannels] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- Fetch ---

  // チャンネルの取得
  const fetchChannels = useCallback(async () => {
    const res = await fetch("/api/channels", { cache: "no-store" });
    const data = await res.json();
    setChannels(data);
  }, []);

  // ログの取得
  const fetchLogs = useCallback(async () => {
    if (!slug) {
      // ルートに移動したときや、初期表示でslugが一瞬未解決のとき
      setLogs([]); // Logをなしに
      setLoading(false); // loadingをfalseにする
      return;
    }
    try {
      const res = await fetch(`/api/channels/${slug}/logs`, { cache: "no-store" });
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []); // ログを配列化して反映（apiがnull/{}を返してもクラッシュしない）
    } finally {
      setLoading(false);
    }
  }, [slug]);

  // --- Initial Load & Dependency Changes ---

  // チャンネルの反映
  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  // ログの反映
  useEffect(() => {
    // 最初に同一レンダーでloading=trueかつlogを空にする（フリッカー防止）
    setLoading(true);
    setLogs([]);
    // その後fetch開始
    fetchLogs(); // チャンネルのログを取得
  }, [fetchLogs]);

  // --- Actions ---

  // use in Sidebar: サイドバーのチャンネルを選択変更したとき
  const onSelectChannel = nextSlug => {
    router.push(`/channel/${nextSlug}`, undefined, { shallow: true });
  };

  // use in Sidebar: サイドバーのチャンネル追加ボタンが押されたとき
  const onAddChannel = async name => {
    const trimmed = name?.trim();

    // 空文字や未入力なら処理しない
    if (!trimmed) {
      alert("チャンネル名を入力してください。");
      return;
    }

    try {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed })
      });

      if (!res.ok) {
        // サーバーが400や500を返したときの対処
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "チャンネルの作成に失敗しました。");
      }

      const newChannel = await res.json();

      setChannels(prev => [...(prev || []), newChannel]);
      // 追加後に遷移
      router.push(`/channel/${newChannel.slug}`, undefined, { shallow: true });
    } catch (e) {
      console.error(e);
    }
  };

  // use in Bottom: ログを送信したとき
  const onSend = async text => {
    console.log(`${slug}にてonSend発火`);
    if (!slug || !/\S/.test(text)) return;
    await fetch(`/api/channels/${slug}/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text })
    });
    // 再取得
    fetchLogs();
  };

  // current channelを渡す
  const currentChannel = useMemo(() => {
    if (!channels || !slug) return null;
    return channels?.find(c => c.slug === slug) || null;
  }, [channels, slug]);

  // --- render-props ---
  return children({
    channels,
    logs,
    loading,
    onSelectChannel,
    onAddChannel,
    onSend,
    currentChannel
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
