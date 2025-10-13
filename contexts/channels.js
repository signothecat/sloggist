// contexts/channels.js
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// Context Object = { Provider: <ReactProviderComponent> , ... } を作る
const ChannelContext = createContext(null);

export function ChannelProvider({ children }) {
  const [channels, setChannels] = useState(null);

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

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  // Homeチャンネルをメモ化
  console.log("channels =", channels, Array.isArray(channels)); // debug
  const home = useMemo(() => (Array.isArray(channels) ? channels.find(c => c.isHome) : undefined), [channels]);

  // 更新の最適化のため、Providerで使うvalueをメモ化
  const value = useMemo(() => ({ channels, home, addChannel }), [channels, home, addChannel]);

  return (
    // 実際に出力されるcomponent名は関数名と同じになる
    <ChannelContext.Provider value={value}>
      {/* channels, home, addChannelをchildrenに渡す */}
      {children}
    </ChannelContext.Provider>
  );
}

export function useChannels() {
  return useContext(ChannelContext);
}
