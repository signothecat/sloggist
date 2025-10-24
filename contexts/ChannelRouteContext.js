// contexts/ChannelRouteContext.js
import { useRouter } from "next/router";
import { createContext, useCallback, useContext, useMemo } from "react";

// Context Object = { Provider: <ReactProviderComponent> , Consumer: ... } を作る
const ChannelRouteContext = createContext(undefined);

export const ChannelRouteProvider = ({ children }) => {
  const router = useRouter();
  const rawSlug = router.query.slug;
  const currentSlug = typeof rawSlug === "string" ? rawSlug : rawSlug?.[0] || null;

  const selectChannel = useCallback(
    nextSlug => {
      if (!nextSlug || nextSlug === currentSlug) return;
      router.push(`/channel/${nextSlug}`, undefined, { shallow: true });
    },
    [router, currentSlug]
  );

  const value = useMemo(() => ({ currentSlug, selectChannel }), [currentSlug, selectChannel]);
  return <ChannelRouteContext.Provider value={value}>{children}</ChannelRouteContext.Provider>;
};

export const useChannelRoute = () => {
  const ctx = useContext(ChannelRouteContext);
  if (ctx === undefined) throw new Error("useChannelRoute must be used within <ChannelRouteProvider>");
  return ctx;
};
