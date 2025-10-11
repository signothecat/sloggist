// components/layout/AppLayout.js
import styles from "@/styles/layout.module.css";
import Bottom from "./Bottom";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }) {
  return (
    <div className={styles.appLayout}>
      <Sidebar />
      <div className={styles.mainPanel}>
        <Header />
        <div className={styles.contentArea}>{children}</div>
        <Bottom />
      </div>
    </div>
  );
}
