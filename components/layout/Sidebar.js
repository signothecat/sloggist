// components/layout/Sidebar.js
import { useChannels } from "@/contexts/channels";
import { useLogs } from "@/contexts/logs";
import { useUser } from "@/contexts/user";
import styles from "@/styles/layout.module.css";
import { Hash, Home, PanelLeft, Plus } from "lucide-react";

export default function Sidebar() {
  const { user } = useUser();
  const { channels, home, addChannel } = useChannels();
  const { currentSlug, selectChannel } = useLogs();

  // === チャンネルが無い場合 ===

  if (!channels || channels.length === 0) {
    return (
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarHeaderBtn}></div>
          <div className={styles.sidebarTitle}></div>
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
                onClick={async () => {
                  const name = prompt("New channel name:");
                  if (!name) return;
                  const newChannel = await addChannel(name);
                  if (newChannel) selectChannel(newChannel.slug);
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

  // === チャンネルがある場合 ===

  const username = user?.username;
  const normalChannels = channels.filter(c => !c.isHome); // Home以外の通常チャンネル
  const homeDisplayName = "Home";

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarHeaderBtn}>
          {username && (
            <div>
              <div>{username}さん</div>
            </div>
          )}
        </div>
        <div className={styles.sidebarHeaderBtn}>
          <PanelLeft size={18} />
        </div>
      </div>

      <div className={styles.sidebarContent}>
        <div className={styles.sidebarScrollContainer}>
          {/* Homeチャンネル */}
          {home && (
            <div className={`${styles.channelListItem} ${home.slug === currentSlug ? styles.active : ""}`} onClick={() => selectChannel(home.slug)}>
              <div className={styles.channelIcon}>
                <Home size={14} strokeWidth={2.5} />
              </div>
              <div className={styles.channelName}>{homeDisplayName}</div>
            </div>
          )}
          {/* 通常チャンネル */}
          <div className={styles.sidebarTitle}>
            <div className={styles.sidebarTitleText}>Channels</div>
            <button
              className={styles.sidebarAddBtn}
              onClick={async () => {
                const name = prompt("New channel name:");
                if (!name) return;
                const newChannel = await addChannel(name);
                if (newChannel) selectChannel(newChannel.slug);
              }}
            >
              <Plus size={16} strokeWidth={2} />
            </button>
          </div>
          {normalChannels.length === 0 ? (
            <div className={styles.noChannel}>There's no channel.</div>
          ) : (
            <ul className={styles.channelList}>
              {normalChannels.map(c => (
                <li
                  key={c.id}
                  onClick={() => selectChannel(c.slug)}
                  className={`${styles.channelListItem} ${c.slug === currentSlug ? styles.active : ""}`}
                >
                  <div className={styles.channelIcon}>
                    <Hash size={14} strokeWidth={2.5} />
                  </div>
                  <div className={styles.channelName}>{c.name}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className={styles.sidebarBottom}>
        <div className={styles.sidebarBottomContent}>ボタンとかが入る</div>
      </div>
    </aside>
  );
}
