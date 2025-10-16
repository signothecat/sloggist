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
      const serverData = Array.isArray(json) ? json : [];

      if (latestReqRef.current[targetSlug] !== reqId) return; // 最新リクエストでなければreturn（棄却）

      // 未確定ログを残しつつ確定ログを反映
      setResourceCache(prev => {
        const prevData = prev[targetSlug]?.data || []; // 直前のcache
        const pendingLogs = prevData.filter(log => log?.isOptimistic); // 未確定ログを抽出
        const merged = [...pendingLogs, ...serverData]; // 未確定ログと確定済みのログをくっつける
        return { ...prev, [targetSlug]: { status: "success", data: merged } };
      });
    } catch {
      if (latestReqRef.current[targetSlug] !== reqId) return;
      setResourceCache(prev => ({ ...prev, [targetSlug]: { status: "error", data: prev[targetSlug]?.data ?? null } }));
    }
  }, []);

  const refreshTimerRef = useRef({}); // { [slug]: number }

  const scheduleRefresh = useCallback(
    (slug, delay = 1000) => {
      const t = refreshTimerRef.current[slug];
      if (t) clearTimeout(t);
      refreshTimerRef.current[slug] = setTimeout(() => {
        fetchLogsOf(slug, { force: true });
        refreshTimerRef.current[slug] = null;
      }, delay);
    },
    [fetchLogsOf]
  );

  // send log by user input
  const sendLog = useCallback(
    async (text, targetSlug) => {
      if (!targetSlug || !/\S/.test(text)) return;

      // 仮ログ・optimistic ui
      const tempSlug = `tmp-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const optimisticLog = { slug: tempSlug, content: text, isOptimistic: true }; // data for optimistic ui

      // 楽観更新、即時に末尾（先頭）に差し込み
      setResourceCache(prev => {
        const current = prev[targetSlug];
        const data = Array.isArray(current?.data) ? [optimisticLog, ...current.data] : [optimisticLog];
        return { ...prev, [targetSlug]: { status: "success", data } };
      });

      try {
        // 並列でPOST
        const res = await fetch(`/api/channels/${targetSlug}/logs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: text }),
        });
        if (!res.ok) throw new Error("Send Failed");

        // 帰ってきた内容がcreatedに入る
        const created = await res.json(); // e.g. { id: "...", content, createdAt, clientId }

        // 未確定ログを確定ログに置換
        setResourceCache(prev => {
          const currentCache = prev[targetSlug] || { status: "success", data: [] };
          const currentLogs = Array.isArray(currentCache.data) ? currentCache.data.slice() : []; // 新しい配列を作る(浅いコピー)
          const foundIndex = currentLogs.findIndex(log => log.slug === tempSlug); // 未確定ログを抽出
          if (foundIndex !== -1) currentLogs[foundIndex] = { ...created, isOptimistic: false }; // createdの内容で上書き・状態を確定に
          else currentLogs.unshift({ ...created, isOptimistic: false }); // 万が一見つからない場合(楽観更新の内容が入っているはずなのでほぼありえないが)
          return { ...prev, [targetSlug]: { status: "success", data: currentLogs } };
        });

        // まとめてfetch
        scheduleRefresh(targetSlug, 1000);
      } catch {
        // rollback処理
        setResourceCache(prev => {
          const current = prev[targetSlug];
          const data = (current?.data || []).filter(log => log.slug !== tempSlug); // 未確定ログが残っていれば取り除く
          return { ...prev, [targetSlug]: { status: "success", data } };
        });
      }
    },
    [fetchLogsOf, scheduleRefresh, setResourceCache]
  );

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
