// components/Main.js
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default function Main({ children, slug }) {
  const router = useRouter();

  // === State ===

  const [channels, setChannels] = useState(null);

  // channelごとの内容の取得結果のcache(status + data)、key は slug、{ [slug]: {status, data} }
  const [resourceCache, setResourceCache] = useState({});

  // === Ref ====

  // race condition 対策
  const seqRef = useRef(0); // number, mutable, from 0, increment
  const latestReqRef = useRef({}); // { [slug]: number }, channelごとの最後に発行したreqIdを保持

  // === Data fetching ===

  // チャンネルの取得
  const fetchChannels = useCallback(async () => {
    const res = await fetch("/api/channels", { cache: "no-store" });
    setChannels(await res.json());
  }, []);

  // ログの取得
  const fetchLogsOf = useCallback(async (targetSlug, { force = false } = {}) => {
    if (!targetSlug) return;

    // 既存データの有無で loading / refreshing を決定
    setResourceCache(prev => {
      const prevItem = prev[targetSlug];
      const hasData = Array.isArray(prevItem?.data);
      const nextStatus = hasData ? "refreshing" : "loading";
      if (!force && prevItem?.status === "success") {
        return { ...prev, [targetSlug]: { status: "refreshing", data: prevItem.data } };
      }
      return { ...prev, [targetSlug]: { status: nextStatus, data: hasData ? prevItem.data : null } };
    });

    const reqId = ++seqRef.current; // たとえば初回なら reqId = 1, seqRef.current = 1
    latestReqRef.current[targetSlug] = reqId;

    try {
      const res = await fetch(`/api/channels/${targetSlug}/logs`, { cache: "no-store" });
      const json = await res.json();
      const data = Array.isArray(json) ? json : [];

      // 最新リクエストでなければ棄却
      if (latestReqRef.current[targetSlug] !== reqId) return;

      // 最新リクエストだと確認できたら、キャッシュする
      setResourceCache(prev => ({ ...prev, [targetSlug]: { status: "success", data } }));
    } catch (e) {
      // エラーの場合
      console.error(e);
      if (latestReqRef.current[targetSlug] !== reqId) return;
      setResourceCache(prev => ({
        ...prev,
        [targetSlug]: { status: "error", data: prev[targetSlug]?.data ?? null }
      }));
    }
  }, []);

  // === Effects ===

  // 初回
  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  // slug 変更でその slug だけ取得（既に success なら何もしない）
  useEffect(() => {
    if (!slug) return;
    const cur = resourceCache[slug];
    if (cur?.status === "success" || cur?.status === "loading" || cur?.status === "refreshing") return;
    fetchLogsOf(slug);
  }, [slug, resourceCache, fetchLogsOf]);

  // === Event handlers ===

  // チャンネル選択時
  const onSelectChannel = nextSlug => {
    if (!nextSlug) return;
    if (nextSlug === slug) return;
    router.push(`/channel/${nextSlug}`, undefined, { shallow: true }); // 状態はuseEffectで処理
  };

  // チャンネル作成時
  const onAddChannel = async name => {
    const trimmed = name?.trim();
    if (!trimmed) {
      alert("Name must contain characters.");
      return;
    }
    try {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed })
      });
      if (!res.ok) throw await res.json().catch(() => ({}));
      const newChannel = await res.json();
      setChannels(prev => [...(prev || []), newChannel]);
      router.push(`/channel/${newChannel.slug}`, undefined, { shallow: true });
    } catch (e) {
      console.error(e);
    }
  };

  // ログ送信（送信時に再取得）
  const onSend = async text => {
    if (!slug || !/\S/.test(text)) return;
    await fetch(`/api/channels/${slug}/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text })
    });
    fetchLogsOf(slug, { force: true });
  };

  // === Selectors / Derived state ===

  // view（UIに渡す唯一の現在の表示状態）
  // view: { status: 'unselected' | 'idle' | 'loading' | 'refreshing' | 'success' | 'error', data: Log[] | null }
  const view = useMemo(() => {
    if (!slug) return { status: "unselected", data: null };
    return resourceCache[slug] ?? { status: "idle", data: null };
  }, [slug, resourceCache]);

  // 現在のチャンネルを返す関数
  const currentChannel = useMemo(() => {
    if (!channels || !slug) return null;
    return channels.find(c => c.slug === slug) || null;
  }, [channels, slug]);

  // === Render ===

  // render-props
  return children({ channels, view, onSelectChannel, onAddChannel, onSend, currentChannel });

  // メモ: children(ctrl); の結果は以下のようになる
  // <AppLayout {...ctrl}>
  //   <Component {...pageProps} />
  // </AppLayout>
  //
  // なぜなら、_app.jsにより、childrenには以下のような関数が入るから
  // children = ctrl => {
  //   <AppLayout {...ctrl}>
  //     <Component {...pageProps} />
  //   </AppLayout>
  // }
}
