// components/layout/Bottom.js
import styles from "@/styles/layout.module.css";
import { SendHorizontal } from "lucide-react";
import { useRef, useState } from "react";

export default function Bottom({ slug, name, cSlug, onSend }) {
  const [text, setText] = useState("");
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
    setText(e.target.value);
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
    if (!/\S/.test(text)) return;
    onSend(text);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <div className={styles.bottom}>
      <div className={styles.bottomContent}>
        <div className={styles.inputContainer} onClick={handleInputContainer}>
          <div className={styles.inputField}>
            <div className={styles.placeholderOverlay}>{!text && slug ? `Send log to #${name}` : ""}</div>
            <textarea
              ref={textareaRef}
              className={styles.inputArea}
              // placeholder={slug ? `Send log to ${slug}` : ""}
              value={text}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={!slug}
            />
          </div>
          <button type="button" className={styles.sendButton} aria-label="Send" onClick={handleSubmit} disabled={!text.trim() || !slug} title="Send">
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
