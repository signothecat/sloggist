// pages/_app.js
import AppLayout from "@/components/layout/AppLayout";
import { ChannelRouteProvider } from "@/contexts/channelRoute";
import { ChannelProvider } from "@/contexts/channels";
import { LogProvider } from "@/contexts/logs";
import { UserProvider } from "@/contexts/user";
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
