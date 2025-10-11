// components/layout/Sidebar.js
import styles from "@/styles/layout.module.css";
import { Hash } from "lucide-react";

export default function Sidebar({ channels = [], currentSlug, onSelect, onAdd }) {
  // チャンネルが無い場合
  if (!channels || channels.length === 0) {
    return (
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarTitle}>
            <h2 className={styles.sidebarTitleText}>Channels</h2>
          </div>
          <button
            className={styles.sidebarAddBtn}
            onClick={() => {
              const name = prompt("New channel name:");
              if (name) onAdd(name);
            }}
          >
            ＋
          </button>
        </div>
        <div className={styles.sidebarContent}>There's no channel.</div>
      </aside>
    );
  }

  // チャンネルがある場合
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarTitle}>
          <h2 className={styles.sidebarTitleText}>Channels</h2>
        </div>
        <button
          className={styles.sidebarAddBtn}
          onClick={() => {
            const name = prompt("New channel name:");
            if (name) onAdd(name);
          }}
        >
          ＋
        </button>
      </div>

      <div className={styles.sidebarContent}>
        <ul className={styles.channelList}>
          {channels.map(c => (
            <li key={c.id} onClick={() => onSelect(c.slug)} className={`${styles.channelListItem} ${c.slug === currentSlug ? styles.active : ""}`}>
              <div className={styles.channelIcon}>
                <Hash size={16} strokeWidth={2.5} />
              </div>
              <div className={styles.channelName}>{c.name}</div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
