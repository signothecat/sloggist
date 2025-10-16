// contexts/logs.js
import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

// Context Object = { Provider: <ReactProviderComponent> , ... } を作る
const LogContext = createContext(null);

export function LogProvider({ children }) {
  // === state / ref ===
  const [resourceCache, setResourceCache] = useState({}); // { [slug]: {status, data} }
  const seqRef = useRef(0); // number, mutable, from 0, increment. Race condition対策
  const latestReqRef = useRef({}); // { [slug]: number }. channelごとの最後に発行したreqIdを保持. Race condition対策

  // fetch logs
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
        window.location.href = "/";
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

  // send log by user input
  const sendLog = useCallback(async (text, targetSlug) => {
    if (!targetSlug || !/\S/.test(text)) return;

    const optimistic = { id: `tmp-${Date.now()}`, content: text, __tmp: true }; // 楽観更新ui用

    // 楽観更新：targetSlugを使い、currentSlugには依存しない
    setResourceCache(prev => {
      const current = prev[targetSlug];
      const data = Array.isArray(current?.data) ? [optimistic, ...current.data] : [optimistic];
      return { ...prev, [targetSlug]: { status: "success", data } };
    });

    try {
      const res = await fetch(`/api/channels/${targetSlug}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      if (!res.ok) throw new Error("Send Failed");
      fetchLogsOf(targetSlug, { force: true });
    } catch {
      setResourceCache(prev => {
        const current = prev[targetSlug];
        const data = (current?.data || []).filter(x => x.id !== optimistic.id);
        return { ...prev, [targetSlug]: { status: "success", data } };
      });
    }
  }, []);

  const getView = useCallback(
    slug => {
      if (!slug) return { status: "unselected", data: null };
      return resourceCache[slug] ?? { status: "idle", data: null };
    },
    [resourceCache]
  );

  // 更新の最適化のため、Providerで使うvalueをメモ化
  const value = useMemo(() => ({ getView, fetchLogsOf, sendLog }), [getView, fetchLogsOf, sendLog]);

  return (
    // 実際に出力されるcomponent名は関数名と同じになる
    <LogContext.Provider value={value}>
      {/* view, fetchLogsOf, sendLogをchildrenに渡す */}
      {children}
    </LogContext.Provider>
  );
}

export function useLogs() {
  return useContext(LogContext);
}
