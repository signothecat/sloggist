// components/channel/ChannelPane.js
import { useChannelRoute } from "@/contexts/channelRoute";
import { useLogs } from "@/contexts/logs";
import styles from "@/styles/channel.module.css";
import { useEffect } from "react";

export default function ChannelPane() {
  const { currentSlug } = useChannelRoute();
  const { getView, fetchLogsOf } = useLogs();
  const view = getView(currentSlug);

  // === idle時（自動fetch） ===
  useEffect(() => {
    if (!currentSlug) return;
    if (view.status === "idle") fetchLogsOf(currentSlug);
  }, [currentSlug, view.status, fetchLogsOf]);

  // === ログ未選択 ===
  if (!currentSlug || view?.status === "unselected") {
    return ui("Select your channel from sidebar!");
  }

  // safeにデータを取り出す
  const safe = Array.isArray(view.data) ? view.data : []; // logを配列化してsafeに入れる

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
      <div className={styles.logList}>
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
