// components/layout/Bottom.js
import styles from "@/styles/layout.module.css";
import { SendHorizontal } from "lucide-react";
import { useRouter } from "next/router";
import { useRef, useState } from "react";

export default function Bottom() {
  const router = useRouter();
  const currentSlug = router.query.slug;
  const [textValue, setTextValue] = useState("");
  const textareaRef = useRef(null);

  const handleInputContainer = () => {
    if (textareaRef.current) {
      textareaRef.current.focus(); // textareaにフォーカスを当てる
    }
  };

  const resizeTextArea = e => {
    const el = e.currentTarget;
    if (!el) return;
    el.style.height = "auto"; // 一度高さをリセット
    el.style.height = `${el.scrollHeight}px`; // 新しいscrollHeightに基づいて高さを設定
  };

  const handleChange = e => {
    setTextValue(e.target.value);
    resizeTextArea(e);
  };

  const handleKeyDown = e => {
    // Ctrl + Enterで送信
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
      return;
    }

    // それ以外（Enterや、Shift + Enter）は改行
  };

  const handleSubmit = () => {
    const text = textValue.trim();
    if (!text) return;
    // ここで送信処理（API呼び出しなど）
    // console.log({ slug: currentSlug, text });
    setTextValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div className={styles.bottom}>
      <div className={styles.bottomContent}>
        <div className={styles.inputContainer} onClick={handleInputContainer}>
          <textarea
            ref={textareaRef}
            className={styles.inputArea}
            placeholder="Type your log"
            value={textValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            type="button"
            className={styles.sendButton}
            aria-label="Send"
            onClick={handleSubmit}
            disabled={!textValue.trim()}
            title="Send (Enter)"
          >
            <SendHorizontal size={16} />
          </button>
        </div>
        <div className={styles.noteWrapper}>
          <small className={styles.note}>Ctrl+Enterで送信</small>
        </div>
      </div>
    </div>
  );
}
