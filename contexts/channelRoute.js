// contexts/channelRoute.js
import { useRouter } from "next/router";
import { createContext, useCallback, useContext, useMemo } from "react";

const ChannelRouteContext = createContext(null);

export function ChannelRouteProvider({ children }) {
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
}

export function useChannelRoute() {
  return useContext(ChannelRouteContext);
}
