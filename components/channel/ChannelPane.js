// components/channel/ChannelPane.js
import styles from "@/styles/channel.module.css";
import { useEffect, useState } from "react";

export default function ChannelPane({ channelSlug }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (!channelSlug) return;

    fetch(`/api/channels/${channelSlug}/logs`, { cache: "no-store" })
      .then(res => res.json())
      .then(data => setLogs(data));
  }, [channelSlug]);

  return (
    <div className={styles.channelPanel}>
      {logs.map(log => (
        <div key={log.id}>{log.content}</div>
      ))}
    </div>
  );
}
