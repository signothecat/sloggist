// components/layout/Sidebar.js
import styles from "@/styles/layout.module.css";
import { Hash, PanelLeft, Plus, Target } from "lucide-react";

export default function Sidebar({ channels = [], currentSlug, onSelect, onAdd }) {
  // チャンネルが無い場合
  if (!channels || channels.length === 0) {
    return (
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarHeaderBtn}>
            <Target size={18} />
          </div>
          <div className={styles.sidebarTitle}>
            <h2 className={styles.sidebarTitleText}>Channels</h2>
          </div>
          <div className={styles.sidebarHeaderBtn}>
            <PanelLeft size={18} />
          </div>
        </div>
        <div className={styles.sidebarContent}>
          <div className={styles.sidebarScrollContainer}>
            <div className={styles.sidebarTitle}>
              <div className={styles.sidebarTitleText}>Channels</div>
              <button
                className={styles.sidebarAddBtn}
                onClick={() => {
                  const name = prompt("New channel name:")?.trim();
                  if (name) onAdd(name);
                }}
              >
                <Plus size={16} strokeWidth={2} />
              </button>
            </div>
            <div className={styles.noChannel}>There's no channel.</div>
          </div>
        </div>
      </aside>
    );
  }

  // チャンネルがある場合
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarHeaderBtn}>
          <Target size={18} />
        </div>
        <div className={styles.sidebarHeaderBtn}>
          <PanelLeft size={18} />
        </div>
      </div>

      <div className={styles.sidebarContent}>
        <div className={styles.sidebarScrollContainer}>
          <div className={styles.sidebarTitle}>
            <div className={styles.sidebarTitleText}>Channels</div>
            <button
              className={styles.sidebarAddBtn}
              onClick={() => {
                const name = prompt("New channel name:")?.trim();
                if (name) onAdd(name);
              }}
            >
              <Plus size={16} strokeWidth={2} />
            </button>
          </div>
          <ul className={styles.channelList}>
            {channels.map(c => (
              <li key={c.id} onClick={() => onSelect(c.slug)} className={`${styles.channelListItem} ${c.slug === currentSlug ? styles.active : ""}`}>
                <div className={styles.channelIcon}>
                  <Hash size={14} strokeWidth={2.5} />
                </div>
                <div className={styles.channelName}>{c.name}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.sidebarBottom}>
        <div className={styles.sidebarBottomContent}>ボタンとかが入る</div>
      </div>
    </aside>
  );
}
