// components/channel/ChannelPane.js
import { useLogs } from "@/contexts/logs";
import styles from "@/styles/channel.module.css";

export default function ChannelPane() {
  const { currentSlug, view } = useLogs();

  // === ログ不明時 ===
  if (!currentSlug || view?.status === "unselected") {
    return ui("Select your channel from sidebar!");
  }
  if (view.status === "idle" || view.status === "loading" || view.status === "refreshing") {
    return ui("Loading...");
  }
  if (view.status === "error") {
    return ui("Failed to load logs.");
  }

  // === ログありもしくは空 ===
  const safe = Array.isArray(view.data) ? view.data : []; // logを配列化してsafeに入れる
  if (safe.length === 0) {
    return ui("There's no logs yet.");
  }
  return (
    <div className={styles.channelPanel}>
      <div className={styles.logList}>
        {safe.map(log => (
          <div className={styles.logContainer} key={log.id}>
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
