// components/layout/Header.js
import styles from "@/styles/layout.module.css";
import { useRouter } from "next/router";

export default function Header() {
  const router = useRouter();
  const currentSlug = router.query.slug;

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        {currentSlug ? <h1 className={styles.headerTitle}>Channel slug: {currentSlug}</h1> : <h1 className={styles.headerTitle}>Welcome 👋</h1>}
      </div>
    </header>
  );
}
