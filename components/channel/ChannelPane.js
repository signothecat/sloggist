// components/channel/ChannelPane.js
import styles from "@/styles/channel.module.css";

export default function ChannelPane({ slug, logs = [], loading }) {
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

  if (logs.length === 0)
    return (
      <div className={styles.channelPanel}>
        <div className={styles.displayNone}>
          <div className={styles.systemMessage}>There's no logs yet.</div>
        </div>
      </div>
    );

  return (
    <div className={styles.channelPanel}>
      {logs.map(log => (
        <div className={styles.logContainer} key={log.id}>
          {log.content}
        </div>
      ))}
    </div>
  );
}
