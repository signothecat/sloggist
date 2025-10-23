// contexts/user.js
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

// Context Object = { Provider: <ReactProviderComponent> , ... } を作る
const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  const fetchMe = useCallback(async () => {
    const res = await fetch("/api/me", { cache: "no-store" });
    if (res.status === 401) {
      window.location.href = "/";
      return;
    }
    const me = await res.json();
    // me は { authenticated: boolean, user: { username, handle } | null }
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
}

export function useUser() {
  return useContext(UserContext);
}
