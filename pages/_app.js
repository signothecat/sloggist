// pages/_app.js
import AppLayout from "@/components/layout/AppLayout";
import Main from "@/components/Main";
import "@/styles/globals.css";
import { useRouter } from "next/router";

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();

  if (!router.isReady) {
    return null;
  }

  const rawSlug = router.query.slug;
  const slug = typeof rawSlug === "string" ? rawSlug : rawSlug?.[0];

  return (
    <Main slug={slug}>
      {ctrl => (
        <AppLayout {...ctrl} slug={slug}>
          <Component {...pageProps} slug={slug} logs={ctrl.logs} loading={ctrl.loading} />
        </AppLayout>
      )}
    </Main>
  );
}
