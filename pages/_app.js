// pages/_app.js
import AppLayout from "@/components/layout/AppLayout";
import "@/styles/globals.css";

export default function MyApp({ Component, pageProps }) {
  return (
    <AppLayout>
      <Component {...pageProps} />
    </AppLayout>
  );
}
