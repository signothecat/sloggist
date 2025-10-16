// components/layout/Sidebar.js
import { useChannelRoute } from "@/contexts/channelRoute";
import { useChannels } from "@/contexts/channels";
import { useUser } from "@/contexts/user";
import styles from "@/styles/layout.module.css";
import { Ellipsis, Hash, Home, PanelLeft, Plus, Search } from "lucide-react";

export default function Sidebar() {
  const { user } = useUser();
  const { currentSlug, selectChannel } = useChannelRoute();
  const { channels, home, addChannel, deleteChannel } = useChannels();

  // === チャンネルが無い場合 ===

  if (!channels || channels.length === 0) {
    return (
      <aside className={styles.sidebar}>
        {/* サイドバーヘッダー */}
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarHeaderLogo}>
            <div className={styles.sidebarHeaderLogoIcon}>🪵</div>
            <div className={styles.sidebarHeaderLogoName}></div>
          </div>
          <div className={styles.sidebarHeaderBtn}>
            <PanelLeft size={16} />
          </div>
        </div>

        <div className={styles.sidebarContent}>
          <div className={styles.sidebarScrollContainer}>
            <div className={styles.sidebarTitleContainer}>
              <div className={styles.sidebarTitle}>Channels</div>
              <button
                className={styles.sidebarAddBtn}
                onClick={async () => {
                  const name = prompt("New channel name:");
                  if (!name) return;
                  const newChannel = await addChannel(name);
                  if (newChannel) selectChannel(newChannel.slug);
                }}
              >
                <Plus size={14} />
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
      {/* サイドバーヘッダー */}
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarHeaderLogo}>
          <div className={styles.sidebarHeaderLogoIcon}>🪵</div>
          {username && <div className={styles.sidebarHeaderLogoName}>{username}</div>}
        </div>
        <div className={styles.sidebarHeaderBtn}>
          <PanelLeft size={16} />
        </div>
      </div>

      {/* サイドバー上部メニュー */}
      <div className={styles.sidebarTopMenu}>
        <div className={styles.list}>
          {/* Homeチャンネル */}
          {home && (
            <div className={`${styles.listItem} ${home.slug === currentSlug ? styles.active : ""}`} onClick={() => selectChannel(home.slug)}>
              <div className={styles.listItemIcon}>
                <Home size={14} />
              </div>
              <div className={styles.listName}>{homeDisplayName}</div>
            </div>
          )}
          {/* 検索 */}
          <div className={styles.listItem}>
            <div className={styles.listItemIcon}>
              <Search size={14} />
            </div>
            <div className={styles.listName}>検索</div>
          </div>
        </div>
      </div>

      {/* サイドバースクロール部分 */}
      <div className={styles.sidebarContent}>
        <div className={styles.sidebarScrollContainer}>
          {/* タイトル：Favorites */}
          <div className={styles.sidebarTitleContainer}>
            <div className={styles.sidebarTitle}>Favorites</div>
          </div>
          {/* タイトル：Channels */}
          <div className={styles.sidebarTitleContainer}>
            <div className={styles.sidebarTitle}>Channels</div>
            <button
              className={styles.sidebarAddBtn}
              onClick={async () => {
                const name = prompt("New channel name:");
                if (!name) return;
                const newChannel = await addChannel(name);
                if (newChannel) selectChannel(newChannel.slug);
              }}
            >
              <Plus size={14} />
            </button>
          </div>
          {/* 通常チャンネル一覧 */}
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
                  <div className={styles.listItemLeft}>
                    <div className={styles.channelIcon}>
                      <Hash size={14} />
                    </div>
                    <div className={styles.channelName}>{c.name}</div>
                  </div>
                  <button className={styles.listItemMenuIcon} onClick={() => deleteChannel(c.slug)}>
                    <Ellipsis size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* サイドバー下メニュー */}
      <div className={styles.sidebarBottom}>
        <div className={styles.sidebarBottomContent}></div>
      </div>
    </aside>
  );
}
