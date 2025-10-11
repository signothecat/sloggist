// components/channel/ChannelPane.js
import styles from "@/styles/channel.module.css";

export default function ChannelPane({ slug, logs = [], loading }) {
  if (!slug) return <div className={styles.channelPanel}>Select your channel from sidebar!</div>;

  if (loading) return <div className={styles.channelPanel}>Loading...</div>;

  if (logs.length === 0) return <div className={styles.channelPanel}>There's no logs yet.</div>;

  return (
    <div className={styles.channelPanel}>
      {logs.map(log => (
        <div key={log.id}>{log.content}</div>
      ))}
    </div>
  );
}
