// pages/_app.js
import AppLayout from "@/components/layout/AppLayout";
import { ChannelRouteProvider } from "@/contexts/ChannelRouteContext";
import { ChannelsProvider } from "@/contexts/ChannelsContext";
import { LogsProvider } from "@/contexts/LogsContext";
import { UserProvider } from "@/contexts/UserContext";
import "@/styles/globals.css";

export default function MyApp({ Component, pageProps }) {
  return (
    <UserProvider>
      <ChannelRouteProvider>
        <ChannelsProvider>
          <LogsProvider>
            <AppLayout>
              <Component {...pageProps} />
            </AppLayout>
          </LogsProvider>
        </ChannelsProvider>
      </ChannelRouteProvider>
    </UserProvider>
  );
}
