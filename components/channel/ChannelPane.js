// components/channel/ChannelPane.js
import styles from "@/styles/channel.module.css";

export default function ChannelPane({ slug, view }) {
  if (!slug || view?.status === "unselected") {
    return ui("Select your channel from sidebar!");
  }

  if (view.status === "idle" || view.status === "loading" || view.status === "refreshing") {
    return ui("Loading...");
  }

  if (view.status === "error") {
    return ui("Failed to load logs.");
  }

  // logを配列化してsafeに入れる
  const safe = Array.isArray(view.data) ? view.data : [];

  // ログなし
  if (safe.length === 0) {
    return ui("There's no logs yet.");
  }

  // ログあり
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
