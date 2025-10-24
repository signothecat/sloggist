// contexts/ChannelsContext.js
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// Context Object = { Provider: <ReactProviderComponent> , Consumer: ... } を作る
const ChannelsContext = createContext(undefined);

export const ChannelsProvider = ({ children }) => {
  const [channels, setChannels] = useState(null);

  // ==============================
  // Handlers
  // ==============================

  const fetchChannels = useCallback(async () => {
    const res = await fetch("/api/channels", { cache: "no-store" });
    if (res.status === 401 || res.status === 404) {
      window.location.href = "/";
      return;
    }
    setChannels(await res.json());
  }, []);

  const addChannel = useCallback(async newName => {
    const trimmed = newName?.trim();
    if (!trimmed) {
      alert("Name must contain characters.");
      return;
    }
    const res = await fetch("/api/channels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });
    if (!res.ok) throw await res.json().catch(() => ({}));
    const newChannel = await res.json();
    setChannels(prev => [...(prev || []), newChannel]);
    return newChannel;
  }, []);

  const deleteChannel = useCallback(
    async slug => {
      if (!slug) return;
      if (!confirm("Delete this channel?")) return;
      setChannels(prev => (Array.isArray(prev) ? prev.filter(c => c.slug !== slug) : prev)); // 楽観更新
      const res = await fetch(`/api/channels/${slug}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        // ロールバック
        await fetchChannels();
        const err = await res.json().catch(() => ({}));
        throw err;
      }
    },
    [fetchChannels]
  );

  // ==============================
  // Effects / Memos
  // ==============================

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  // Homeチャンネルをメモ化
  const home = useMemo(() => (Array.isArray(channels) ? channels.find(c => c.isHome) : undefined), [channels]);

  // 更新の最適化のため、Providerで使うvalueをメモ化
  const value = useMemo(() => ({ channels, home, addChannel, deleteChannel }), [channels, home, addChannel, deleteChannel]);

  // ==============================
  // Render
  // ==============================

  return (
    // 実際に出力されるcomponent名は関数名と同じになる
    <ChannelsContext.Provider value={value}>
      {/* channels, home, addChannelをchildrenに渡す */}
      {children}
    </ChannelsContext.Provider>
  );
};

export const useChannels = () => {
  const ctx = useContext(ChannelsContext);
  if (ctx === undefined) throw new Error("useChannels must be used within <ChannelsProvider>");
  return ctx;
};
