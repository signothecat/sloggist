// components/layout/Sidebar.js
import styles from "@/styles/layout.module.css";
import { Hash } from "lucide-react";
import { useRouter } from "next/router";
import useSWR from "swr";

const fetcher = url => fetch(url, { cache: "no-store" }).then(r => r.json());

export default function Sidebar() {
  const router = useRouter();
  const { data: channels, mutate } = useSWR("/api/channels", fetcher);
  const currentSlug = router.query.slug;

  // チャンネル選択
  const handleSelect = slug => {
    router.push(`/channel/${slug}`, undefined, { shallow: true });
  };

  // チャンネル追加
  const handleAddChannel = async () => {
    const name = prompt("新しいチャンネル名：");
    if (!name) return;

    const res = await fetch("/api/channels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });
    const newChannel = await res.json();

    // swrのcacheを更新してuiに反映(false=>fetchを待たない)
    mutate([...(channels || []), newChannel], false);
  };

  if (!channels) return <div className="sidebar">There is no channels.</div>;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.sidebarTitle}>
          <h2 className={styles.sidebarTitleText}>Channels</h2>
        </div>
        <button className={styles.sidebarAddBtn} onClick={handleAddChannel}>
          ＋
        </button>
      </div>

      <ul className={styles.channelList}>
        {channels.map(c => (
          <li key={c.id} onClick={() => handleSelect(c.slug)} className={`${styles.channelListItem} ${c.slug === currentSlug ? styles.active : ""}`}>
            <div className={styles.channelIcon}>
              <Hash size={16} strokeWidth={2.5} />
            </div>
            <div className={styles.channelName}>{c.name}</div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
