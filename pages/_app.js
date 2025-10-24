// pages/_app.js
import AppLayout from "@/components/layout/AppLayout";
import { ChannelRouteProvider } from "@/contexts/ChannelRouteContext";
import { ChannelProvider } from "@/contexts/ChannelsContext";
import { LogProvider } from "@/contexts/LogsContext";
import { UserProvider } from "@/contexts/UserContext";
import "@/styles/globals.css";

export default function MyApp({ Component, pageProps }) {
  return (
    <UserProvider>
      <ChannelRouteProvider>
        <ChannelProvider>
          <LogProvider>
            <AppLayout>
              <Component {...pageProps} />
            </AppLayout>
          </LogProvider>
        </ChannelProvider>
      </ChannelRouteProvider>
    </UserProvider>
  );
}
