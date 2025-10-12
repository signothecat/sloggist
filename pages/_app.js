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

  // slug：router.queryから入れる
  const rawSlug = router.query.slug; // router.queryからslugを取り出す
  const slug = typeof rawSlug === "string" ? rawSlug : rawSlug?.[0]; // slugに入れる（rawSlugが配列なら最初の項目を取得）

  return (
    <Main slug={slug}>
      {ctrl => (
        <AppLayout {...ctrl} slug={slug}>
          <Component {...pageProps} slug={slug} view={ctrl.view} />
        </AppLayout>
      )}
    </Main>
  );
}
