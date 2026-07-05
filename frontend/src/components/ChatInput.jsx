import { useState, useRef, useEffect } from "react";

/**
 * ChatInput — auto-growing textarea with send button.
 * Enter = send, Shift+Enter = newline.
 * Disabled while loading or when there's no active persona.
 */
export default function ChatInput({ onSend, loading, disabled }) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  // Auto-resize the textarea as content grows / shrinks
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  const canSend = text.trim().length > 0 && !loading && !disabled;

  const handleSend = () => {
    if (!canSend) return;
    onSend(text.trim());
    setText("");
    // Reset height after send
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-input-area">
      <textarea
        ref={textareaRef}
        id="chat-textarea"
        className="chat-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={
          disabled
            ? "Loading personas…"
            : loading
            ? "Waiting for reply…"
            : "Message… (Enter to send, Shift+Enter for newline)"
        }
        disabled={loading || disabled}
        rows={1}
        aria-label="Message input"
        autoFocus
      />
      <button
        id="send-button"
        className="send-button"
        onClick={handleSend}
        disabled={!canSend}
        aria-label="Send message"
        title="Send (Enter)"
      >
        {/* Arrow-up send icon */}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
             strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="12" y1="19" x2="12" y2="5" />
          <polyline points="5 12 12 5 19 12" />
        </svg>
      </button>
    </div>
  );
}
