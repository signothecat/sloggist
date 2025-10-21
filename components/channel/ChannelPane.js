// components/channel/ChannelPane.js
import { useChannelRoute } from "@/contexts/channelRoute";
import { useChannels } from "@/contexts/channels";
import { useLogs } from "@/contexts/logs";
import styles from "@/styles/channel.module.css";
import { useEffect, useLayoutEffect, useRef } from "react";

// rAFをやめてuseLayoutEffectを使うように修正するところから再開
// 同上

const NEAR_BOTTOM_PX = 20;

export default function ChannelPane() {
  const { currentSlug } = useChannelRoute();
  const { channels } = useChannels();
  const { getView, fetchLogsOf, lastLocalSend } = useLogs();
  const view = getView(currentSlug);
  // === スクロール用refs ===
  const listRef = useRef(null);
  const prevViewStatusRef = useRef(view.status);
  const scrollRef = useRef({}); // { [slug]: { initialDone: boolean, wasNearBottom: boolean, scrollTop: number } }
  const restoredThisNavRef = useRef(false); // 遷移内でスクロール位置の復元をしたかどうか
  const slugExists = !!(currentSlug && Array.isArray(channels) && channels.some(c => c.slug === currentSlug)); // 表示しているチャンネルのslugがchannelsにあるかどうか

  // === idle時（自動fetch） ===
  useEffect(() => {
    if (!currentSlug) return;
    if (!slugExists) return; // 削除直後に自動fetchしないように
    if (view.status === "idle") fetchLogsOf(currentSlug);
  }, [currentSlug, slugExists, view.status, fetchLogsOf]);

  // チャンネル切替ごとにscroll関連の状態を初期化
  useLayoutEffect(() => {
    if (!currentSlug) return;

    // 1) scrollStatusをstoreとして参照コピー、なければ作成して保存
    const scrollStatus =
      scrollRef.current[currentSlug] || (scrollRef.current[currentSlug] = { initialDone: false, wasNearBottom: true, scrollTop: 0 });

    // 2) 前回の状態（別チャンネルのもの）を初期化
    prevViewStatusRef.current = undefined;
    restoredThisNavRef.current = false;

    // 3) scrollTop復元 or 最下部へ移動
    requestAnimationFrame(() => {
      const el = listRef.current;
      if (!el) return;

      const maxTop = Math.max(0, el.scrollHeight - el.clientHeight);

      // 前回位置を復元or最下部へ
      const targetTop = scrollStatus.initialDone ? Math.min(scrollStatus.scrollTop, maxTop) : maxTop;
      el.scrollTop = targetTop;

      // 4) wasNearBottom・scrollTopを同期更新
      scrollStatus.scrollTop = targetTop;
      scrollStatus.wasNearBottom = targetTop >= maxTop - NEAR_BOTTOM_PX;
      restoredThisNavRef.current = !!scrollStatus.initialDone; // initialDoneがtrueの回ならtrueに
    });
  }, [currentSlug]);

  // === ログ未選択 ===
  if (!currentSlug || view?.status === "unselected") {
    return ui("Select your channel from sidebar!");
  }

  // safeにデータを取り出す
  const safe = Array.isArray(view.data) ? view.data : []; // logを配列化してsafeに入れる

  // 表示切替時に初回アクセスor前回下付近なら最下部へスクロール
  useEffect(() => {
    if (!currentSlug) return;

    const scrollStatus =
      // scrollRefを参照コピー
      scrollRef.current[currentSlug] || (scrollRef.current[currentSlug] = { initialDone: false, wasNearBottom: true, scrollTop: 0 });

    const prevViewStatus = prevViewStatusRef.current;
    const currentViewStatus = view.status;
    const justLoaded = prevViewStatus !== currentViewStatus && currentViewStatus === "success";

    // 最下部へスクロールするユーティリティ(初回or前回下付近で実行される)
    const scrollToBottom = () => {
      requestAnimationFrame(() => {
        const el2 = listRef.current;
        if (!el2) return;
        // 最下部へ
        el2.scrollTop = el2.scrollHeight;
        // scrollStatus更新
        scrollStatus.initialDone = true; // 初回を済にする
        scrollStatus.scrollTop = el2.scrollTop;
        scrollStatus.wasNearBottom = true;
      });
    };

    if (justLoaded && (!scrollStatus.initialDone || scrollStatus.wasNearBottom) && !restoredThisNavRef.current) {
      // ロード後、初回アクセスor前回下付近なら最下部へ
      scrollToBottom();
    }

    prevViewStatusRef.current = currentViewStatus;
    restoredThisNavRef.current = false;
  }, [view.status, currentSlug]);

  // タブ内でログ送信した場合は最下部へ
  useEffect(() => {
    if (!lastLocalSend || lastLocalSend.slug !== currentSlug) return;
    const el = listRef.current;
    if (!el) return;
    const scrollStatus =
      // scrollRefを参照コピー
      scrollRef.current[currentSlug] || (scrollRef.current[currentSlug] = { initialDone: false, wasNearBottom: true, scrollTop: 0 });
    requestAnimationFrame(() => {
      const el2 = listRef.current;
      if (!el2) return;
      // 最下部へ
      el2.scrollTop = el2.scrollHeight;
      // scrollStatus更新
      scrollStatus.initialDone = true;
      scrollStatus.wasNearBottom = true;
      scrollStatus.scrollTop = el2.scrollTop;
    });
  }, [lastLocalSend, currentSlug]);

  const handleScroll = () => {
    const el = listRef.current;
    if (!el || !currentSlug) return;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - NEAR_BOTTOM_PX; // boolean, 24px以内なら下端にいると見なす
    const scrollStatus =
      // scrollRefを参照コピー
      scrollRef.current[currentSlug] || (scrollRef.current[currentSlug] = { initialDone: false, wasNearBottom: true, scrollTop: 0 });
    // scrollStatus更新
    scrollStatus.wasNearBottom = nearBottom;
    scrollStatus.scrollTop = el.scrollTop;
  };

  // === ログ選択済み、ローディング中 ===
  if ((view.status === "idle" || view.status === "loading") && safe.length === 0) {
    return ui("Loading...");
  }

  // === ログ選択済み、エラー時 ===
  if (view.status === "error") {
    return ui("Failed to load logs.");
  }

  // === ログ選択済み、表示完了時 ===
  if (safe.length === 0) {
    return ui("There's no logs yet.");
  }
  return (
    <div className={styles.channelPanel}>
      <div className={styles.logList} ref={listRef} onScroll={handleScroll}>
        {safe.map(log => (
          <div className={styles.logContainer} key={log.slug}>
            {log.content}
          </div>
        ))}
      </div>
    </div>
  );

  // === ログ不明時の共通レイアウト ===
  function ui(message) {
    return (
      <div className={styles.channelPanel}>
        <div className={styles.displayNone}>
          <div className={styles.systemMessage}>{message}</div>
        </div>
      </div>
    );
  }
}
