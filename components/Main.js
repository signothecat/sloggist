// components/Main.js
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default function Main({ children, slug }) {
  const router = useRouter();

  // === State ===
  const [user, setUser] = useState(null); // ユーザー情報、安全な情報のみ
  const [channels, setChannels] = useState(null); // チャンネル一覧
  const [resourceCache, setResourceCache] = useState({}); // channelごとのcache(status + data)、{ [slug]: {status, data} }

  // === Ref ====
  // race condition 対策
  const seqRef = useRef(0); // number, mutable, from 0, increment
  const latestReqRef = useRef({}); // { [slug]: number }, channelごとの最後に発行したreqIdを保持

  // === Data fetching ===
  // ユーザー名などの取得
  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      if (res.status === 401) {
        router.replace("/");
        return;
      }
      const json = await res.json();
      setUser({ username: json.username, handle: json.handle });
    } catch {}
  }, [router]);

  // チャンネルの取得
  const fetchChannels = useCallback(async () => {
    try {
      const res = await fetch("/api/channels", { cache: "no-store" });
      if (res.status === 401 || res.status === 404) {
        router.replace("/");
        return;
      }
      setChannels(await res.json());
    } catch {}
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
      if (res.status === 401 || res.status === 404) {
        router.replace("/");
        return;
      }
      const json = await res.json();
      const data = Array.isArray(json) ? json : [];

      if (latestReqRef.current[targetSlug] !== reqId) return; // 最新リクエストでなければ棄却
      setResourceCache(prev => ({ ...prev, [targetSlug]: { status: "success", data } })); // 最新リクエストならキャッシュする
    } catch {
      if (latestReqRef.current[targetSlug] !== reqId) return;
      setResourceCache(prev => ({ ...prev, [targetSlug]: { status: "error", data: prev[targetSlug]?.data ?? null } }));
    }
  }, []);

  // ログ送信（送信時に再取得）
  const onSend = async text => {
    if (!slug || !/\S/.test(text)) return;
    const optimistic = { id: `tmp-${Date.now()}`, content: text, __tmp: true }; // 楽観更新ui用
    setResourceCache(prev => {
      const current = prev[slug];
      const data = Array.isArray(current?.data) ? [optimistic, ...current.data] : [optimistic];
      return { ...prev, [slug]: { status: "success", data } };
    });
    try {
      const res = await fetch(`/api/channels/${slug}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text })
      });
      if (!res.ok) throw new Error("onSend Failed");
      fetchLogsOf(slug, { force: true });
    } catch {
      setResourceCache(prev => {
        const current = prev[slug];
        const data = (current?.data || []).filter(x => x.id !== optimistic.id);
        return { ...prev, [slug]: { status: "success", data } };
      });
    }
  };

  // === Effects ===

  // 初回
  useEffect(() => {
    fetchMe();
    fetchChannels();
  }, [fetchMe, fetchChannels]);

  // slug 変更でその slug だけ取得（既に success なら何もしない）
  useEffect(() => {
    if (!slug) return;
    const current = resourceCache[slug];
    if (current?.status === "success" || current?.status === "loading" || current?.status === "refreshing") return;
    fetchLogsOf(slug);
  }, [slug, resourceCache, fetchLogsOf]);

  // === Selectors / Derived state ===

  // view（UIに渡す唯一の現在の表示状態）
  // { status: 'unselected' | 'idle' | 'loading' | 'refreshing' | 'success' | 'error', data: Log[] | null }
  const view = useMemo(() => {
    if (!slug) return { status: "unselected", data: null };
    return resourceCache[slug] ?? { status: "idle", data: null };
  }, [slug, resourceCache]);

  // 現在のチャンネルを返す関数
  const currentChannel = useMemo(() => {
    if (!channels || !slug) return null;
    return channels.find(c => c.slug === slug) || null;
  }, [channels, slug]);

  // === Event handlers ===

  // チャンネル選択時
  const onSelectChannel = nextSlug => {
    if (!nextSlug || nextSlug === slug) return;
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

  // === Render ===

  // render-props
  return children({ user, channels, view, onSelectChannel, onAddChannel, onSend, currentChannel });

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
