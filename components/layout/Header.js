// components/layout/Header.js
import { useChannels } from "@/contexts/channels";
import { useLogs } from "@/contexts/logs";
import styles from "@/styles/layout.module.css";

export default function Header() {
  const { channels } = useChannels();
  const { currentSlug } = useLogs();

  const currentChannelName = channels?.find(c => c.slug === currentSlug)?.name ?? "Welcome👋";
  const safeCurrentSlug = currentChannelName === "Welcome👋" ? "-" : currentSlug;

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.headerTitleWrapper}>
          <h1 className={styles.headerTitle}>{currentChannelName}</h1>
        </div>
        <div className={styles.headerSlugWrapper}>
          <small className={styles.headerSlug}>{safeCurrentSlug}</small>
        </div>
      </div>
    </header>
  );
}
