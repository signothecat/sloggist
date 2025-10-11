// components/layout/Header.js
import styles from "@/styles/layout.module.css";

export default function Header({ slug, name, cSlug }) {
  const hasChannel = Boolean(slug);

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.headerTitleWrapper}>
          {name ? <h1 className={styles.headerTitle}>{name}</h1> : <h1 className={styles.headerTitle}>Welcome👋</h1>}
        </div>
        <div className={styles.headerSlugWrapper}>
          {slug ? <small className={styles.headerSlug}>{cSlug}</small> : <small className={styles.headerSlug}>-</small>}
        </div>
      </div>
    </header>
  );
}
