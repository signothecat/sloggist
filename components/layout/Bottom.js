// components/layout/Bottom.js
import { useChannelRoute } from "@/contexts/channelRoute";
import { useChannels } from "@/contexts/channels";
import { useLogs } from "@/contexts/logs";
import styles from "@/styles/layout.module.css";
import { SendHorizontal } from "lucide-react";
import { useCallback, useRef, useState } from "react";

export default function Bottom() {
  const { currentSlug } = useChannelRoute();
  const { channels } = useChannels();
  const { sendLog } = useLogs();
  const currentChannelName = channels?.find(c => c.slug === currentSlug)?.name;

  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  const handleInputContainer = () => {
    textareaRef.current?.focus(); // textareaにフォーカスを当てる
  };

  const resizeTextArea = useCallback(e => {
    const el = e.currentTarget;
    if (!el) return;
    el.style.height = "auto"; // 一度高さをリセット
    el.style.height = `${el.scrollHeight}px`; // 新しいscrollHeightに基づいて高さを設定
  }, []);

  const handleChange = useCallback(
    e => {
      setText(e.target.value);
      resizeTextArea(e);
    },
    [resizeTextArea]
  );

  const handleSubmit = useCallback(() => {
    if (!/\S/.test(text) || !currentSlug) return;
    sendLog(text, currentSlug);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [text, currentSlug, sendLog]);

  const handleKeyDown = useCallback(
    e => {
      // Enterで送信
      if (e.key === "Enter" && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        handleSubmit();
      }

      // Ctrl + Enter / Command + Enter / Shift + Enter は改行
    },
    [handleSubmit]
  );

  // const handleKeyDown = useCallback(
  //   e => {
  //     // Ctrl + Enterで送信
  //     if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
  //       e.preventDefault();
  //       handleSubmit();
  //     }
  //     // それ以外（Enterや、Shift + Enter）は改行
  //   },
  //   [handleSubmit]
  // );

  return (
    <div className={styles.bottom}>
      <div className={styles.bottomContent}>
        <div className={styles.inputContainer} onClick={handleInputContainer}>
          <div className={styles.inputField}>
            <div className={styles.placeholderOverlay}>{!text && currentSlug ? `Send log to #${currentChannelName}` : ""}</div>
            <textarea
              ref={textareaRef}
              className={styles.inputArea}
              value={text}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={!currentSlug}
            />
          </div>
          <button
            type="button"
            className={styles.sendButton}
            aria-label="Send"
            onClick={handleSubmit}
            disabled={!text.trim() || !currentSlug}
            title="Send"
          >
            <SendHorizontal size={16} strokeWidth={1.5} absoluteStrokeWidth={true} />
          </button>
        </div>
        <div className={styles.noteWrapper}>
          <small className={styles.note}>Ctrl+Enterで送信</small>
        </div>
      </div>
    </div>
  );
}
