/**
 * MessageBubble — renders one chat message.
 * Visually distinct for role === "user" vs "assistant".
 * The "typing" variant shows an animated three-dot indicator.
 */
export default function MessageBubble({ message, personaName }) {
  const { role, content } = message;
  const isUser = role === "user";
  const isTyping = role === "typing";

  return (
    <div
      className={`message-bubble ${isUser ? "user" : "assistant"}${isTyping ? " typing" : ""}`}
      aria-label={isUser ? "Your message" : `${personaName ?? "Assistant"} message`}
    >
      <span className="bubble-meta">
        {isUser ? "You" : isTyping ? "…" : personaName ?? "Assistant"}
      </span>
      <div className="bubble-content">
        {isTyping ? (
          <div className="typing-dots" aria-label="Typing">
            <span />
            <span />
            <span />
          </div>
        ) : (
          content
        )}
      </div>
    </div>
  );
}
