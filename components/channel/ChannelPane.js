// components/channel/ChannelPane.js
import styles from "@/styles/channel.module.css";

export default function ChannelPane({ slug, logs, loading }) {
  // logsがnullや{}やundefinedの場合にクラッシュしないように配列化
  const safeLogs = Array.isArray(logs) ? logs : [];

  if (!slug)
    return (
      <div className={styles.channelPanel}>
        <div className={styles.displayNone}>
          <div className={styles.systemMessage}>Select your channel from sidebar!</div>
        </div>
      </div>
    );

  if (loading)
    return (
      <div className={styles.channelPanel}>
        <div className={styles.displayNone}>
          <div className={styles.systemMessage}>Loading...</div>
        </div>
      </div>
    );

  if (safeLogs.length === 0)
    return (
      <div className={styles.channelPanel}>
        <div className={styles.displayNone}>
          <div className={styles.systemMessage}>There's no logs yet.</div>
        </div>
      </div>
    );

  return (
    <div className={styles.channelPanel}>
      <div className={styles.logList}>
        {safeLogs.map(log => (
          <div className={styles.logContainer} key={log.id}>
            {log.content}
          </div>
        ))}
      </div>
    </div>
  );
}
