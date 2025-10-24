// components/layout/AppLayout.js
import Bottom from "@/components/layout/Bottom";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import styles from "@/styles/layout.module.css";

export default function AppLayout({ children }) {
  return (
    <div className={styles.appLayout}>
      <Sidebar />
      <div className={styles.mainPanel}>
        <Header />
        <div className={styles.contentArea}>
          {/* <ChannelPane>([slug].js)がreturnされる */}
          {children}
        </div>
        <Bottom />
      </div>
    </div>
  );
}
