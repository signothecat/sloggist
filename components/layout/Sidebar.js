// components/layout/Sidebar.js
import { useChannelRoute } from "@/contexts/channelRoute";
import { useChannels } from "@/contexts/channels";
import { useLogs } from "@/contexts/logs";
import { useUser } from "@/contexts/user";
import styles from "@/styles/layout.module.css";
import { Ellipsis, Hash, Home, PanelLeft, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const MENU_NEED_MARGIN = 120; //px

export default function Sidebar() {
  const { user } = useUser();
  const { currentSlug, selectChannel } = useChannelRoute();
  const { channels, home, addChannel, deleteChannel } = useChannels();
  const { clearChannelLogs } = useLogs();

  // ==============================
  // メニュー表示
  // ==============================

  const [menuOpenSlug, setMenuOpenSlug] = useState(null);
  const menuRef = useRef(null);
  const anchorRef = useRef(null); // 上下確定用、どのボタンから開いたか
  const scrollContainerRef = useRef(null); // 上下確定用
  const [dropDir, setDropDir] = useState("down"); // 上下確定用、"down" | "up"
  const [menuReady, setMenuReady] = useState(false); // 上下確定用、方向が決まるまで不可視にするためのstate

  // === Handlers ===

  // メニューを上下どちらに開くか決める関数
  const decideDropDir = () => {
    const anchorEl = anchorRef.current;
    const containerEl = scrollContainerRef.current;
    if (!anchorEl || !containerEl) return;

    const contRect = containerEl.getBoundingClientRect();
    const btnRect = anchorEl.getBoundingClientRect();

    // コンテナ可視領域内での「ボタン下端」の位置（px）
    const anchorBottomInView = btnRect.bottom - contRect.top;
    const spaceBelow = Math.max(0, containerEl.clientHeight - anchorBottomInView);

    setDropDir(spaceBelow < MENU_NEED_MARGIN ? "up" : "down");
  };

  // === Effects ===

  // メニューが開いてから座標を取得して表示方向を確定させるeffect
  useEffect(() => {
    if (!menuOpenSlug) return;
    requestAnimationFrame(() => {
      decideDropDir();
      setMenuReady(true);
    });
    const onScroll = () => requestAnimationFrame(decideDropDir);
    const onResize = () => requestAnimationFrame(decideDropDir);
    const sc = scrollContainerRef.current;

    sc?.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      sc?.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      setMenuReady(false);
    };
  }, [menuOpenSlug]);

  // Escで閉じるためのeffect
  useEffect(() => {
    if (!menuOpenSlug) return;
    const onKey = e => {
      if (e.key === "Escape") setMenuOpenSlug(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpenSlug]);

  // ==============================
  // render
  // ==============================

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
            <PanelLeft size={16} strokeWidth={1.5} absoluteStrokeWidth={true} />
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
                <Plus size={14} strokeWidth={1.5} absoluteStrokeWidth={true} />
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
          <PanelLeft size={16} strokeWidth={1.5} absoluteStrokeWidth={true} />
        </div>
      </div>

      {/* サイドバー上部メニュー */}
      <div className={styles.sidebarTopMenu}>
        <div className={styles.list}>
          {/* Homeチャンネル */}
          {home && (
            <div className={`${styles.listItem} ${home.slug === currentSlug ? styles.active : ""}`} onClick={() => selectChannel(home.slug)}>
              <div className={styles.listItemIcon}>
                <Home size={14} strokeWidth={1.5} absoluteStrokeWidth={true} />
              </div>
              <div className={styles.listName}>{homeDisplayName}</div>
            </div>
          )}
          {/* 検索 */}
          <div className={styles.listItem}>
            <div className={styles.listItemIcon}>
              <Search size={14} strokeWidth={1.5} absoluteStrokeWidth={true} />
            </div>
            <div className={styles.listName}>検索</div>
          </div>
        </div>
      </div>

      {/* サイドバースクロール部分 */}
      <div className={styles.sidebarContent}>
        <div className={styles.sidebarScrollContainer} ref={scrollContainerRef}>
          {/* Favorites */}
          <div className={styles.sidebarTitleContainer}>
            <div className={styles.sidebarTitle}>Favorites</div>
          </div>

          {/* Channels */}
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
              <Plus size={14} strokeWidth={1.5} absoluteStrokeWidth={true} />
            </button>
          </div>

          {/* チャンネル一覧 */}
          {normalChannels.length === 0 ? (
            <div className={styles.noChannel}>There's no channel.</div>
          ) : (
            <div role="list" className={styles.channelList}>
              {normalChannels.map(c => {
                const isActive = c.slug === currentSlug;
                const isOpen = menuOpenSlug === c.slug;
                return (
                  <div
                    role="listitem"
                    key={c.id}
                    tabIndex={0}
                    onClick={() => selectChannel(c.slug)}
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === " ") {
                        // Enter/Space押下でselectChannel
                        e.preventDefault();
                        selectChannel(c.slug);
                      }
                    }}
                    className={`${styles.channelListItem} ${styles.itemWithMenu} ${isActive ? styles.active : ""} ${isOpen ? styles.openItem : ""}`}
                  >
                    <div className={styles.listItemLeft}>
                      <div className={styles.channelIcon}>
                        <Hash size={14} strokeWidth={1.5} absoluteStrokeWidth={true} />
                      </div>
                      <div className={styles.channelName}>{c.name}</div>
                    </div>
                    {/* メニューボタン */}
                    <button
                      type="button"
                      className={styles.listItemMenuIcon}
                      aria-label={`Menu button of ${c.name}`}
                      aria-haspopup="menu"
                      aria-expanded={isOpen}
                      onClick={e => {
                        e.stopPropagation(); // 親のonClickを防ぐ
                        anchorRef.current = e.currentTarget; // アンカー更新
                        decideDropDir(); // 方向決定
                        setMenuReady(false); // 一旦不可視に
                        setMenuOpenSlug(prev => (prev === c.slug ? null : c.slug));
                      }}
                      onKeyDown={e => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          anchorRef.current = e.currentTarget; // アンカー更新
                          decideDropDir(); // 方向決定
                          setMenuReady(false); // 一旦不可視に
                          setMenuOpenSlug(prev => (prev === c.slug ? null : c.slug));
                        }
                      }}
                      title="Open menu"
                    >
                      <Ellipsis size={14} strokeWidth={1.5} absoluteStrokeWidth={true} />
                    </button>
                    {/* メニュー本体 */}
                    {isOpen && (
                      <div
                        ref={menuRef}
                        className={`${styles.dropdownMenu} ${dropDir === "up" ? styles.dropUp : ""}`}
                        data-ready={menuReady ? "true" : "false"}
                        role="menu"
                        aria-label={`Menu of ${c.name}`}
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          role="menuitem"
                          className={`${styles.menuItemBtn} ${styles.menuItemDeleteBtn}`}
                          onClick={async () => {
                            const targetSlug = c.slug;
                            await deleteChannel(targetSlug);
                            clearChannelLogs(targetSlug);
                            setMenuOpenSlug(null);

                            // 削除後の遷移（通常Homeへ）
                            if (targetSlug === currentSlug) {
                              const nextSlug = home?.slug ?? channels?.find(c => !c.isHome && c.slug !== targetSlug)?.slug;
                              if (nextSlug) selectChannel(nextSlug);
                            }
                          }}
                        >
                          <Trash2 size={14} strokeWidth={1.5} absoluteStrokeWidth={true} />
                          チャンネルを削除
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* サイドバー下メニュー */}
      <div className={styles.sidebarBottom}>
        <div className={styles.sidebarBottomContent}></div>
      </div>

      {/* メニュー表示時のオーバーレイ */}
      {menuOpenSlug && <div className={styles.menuOverlay} onClick={() => setMenuOpenSlug(null)} aria-hidden="true" />}
    </aside>
  );
}
