// components/layout/AppLayout.js
import styles from "@/styles/layout.module.css";
import Bottom from "./Bottom";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AppLayout({
  // 親から受け取ったprops
  children,
  slug,
  channels,
  onSelectChannel,
  onAddChannel,
  onSend
}) {
  return (
    <div className={styles.appLayout}>
      <Sidebar channels={channels} currentSlug={slug} onSelect={onSelectChannel} onAdd={onAddChannel} />
      <div className={styles.mainPanel}>
        <Header slug={slug} />
        <div className={styles.contentArea}>{children}</div>
        <Bottom slug={slug} onSend={onSend} />
      </div>
    </div>
  );
}
