// contexts/UserContext.js
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// Context Object = { Provider: <ReactProviderComponent> , Consumer: ... } を作る
const UserContext = createContext(undefined);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const fetchMe = useCallback(async () => {
    const res = await fetch("/api/me", { cache: "no-store" });
    if (res.status === 401) {
      window.location.href = "/";
      return;
    }
    const me = await res.json(); // { authenticated: boolean, user: { username, handle } | null }
    setUser(me.user ?? null);
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  // 更新の最適化のため、Providerで使うvalueをメモ化
  const value = useMemo(() => ({ user }), [user]);

  return (
    // 実際に出力されるcomponent名は関数名と同じになる
    <UserContext.Provider value={value}>
      {/* userをchildrenに渡す */}
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (ctx === undefined) throw new Error("useUser must be used within <UserProvider>");
  return ctx;
};
