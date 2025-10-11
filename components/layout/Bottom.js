// components/layout/Bottom.js
import styles from "@/styles/layout.module.css";
import { SendHorizontal } from "lucide-react";
import { useRef, useState } from "react";

export default function Bottom({ slug, onSend }) {
  const [textValue, setTextValue] = useState("");
  const textareaRef = useRef(null);

  const handleInputContainer = () => {
    textareaRef.current?.focus(); // textareaにフォーカスを当てる
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
    }
    // それ以外（Enterや、Shift + Enter）は改行
  };

  const handleSubmit = () => {
    const text = textValue.trim();
    if (!text) return;
    onSend(text); // 親(Main)に送信処理を任せる
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
            placeholder={slug ? `Send log to ${slug}` : ""}
            value={textValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={!slug}
          />
          <button
            type="button"
            className={styles.sendButton}
            aria-label="Send"
            onClick={handleSubmit}
            disabled={!textValue.trim() || !slug}
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
