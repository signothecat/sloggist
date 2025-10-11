// components/layout/Header.js
import styles from "@/styles/layout.module.css";

export default function Header({ slug }) {
  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        {slug ? <h1 className={styles.headerTitle}>{slug}</h1> : <h1 className={styles.headerTitle}>Welcome 👋</h1>}
      </div>
    </header>
  );
}
