import ReactMarkdown from "react-markdown";

/**
 * MessageBubble — renders one chat message.
 * Visually distinct for role === "user" vs "assistant".
 * Assistant bubbles render markdown (bold, links, code, lists, etc.).
 * The "typing" variant shows an animated three-dot indicator.
 */

const PERSONA_AVATARS = {
  piyush: "/piyush.png",
  hitesh: "/Hitesh.png",
};

export default function MessageBubble({ message, personaName, personaId }) {
  const { role, content } = message;
  const isUser    = role === "user";
  const isTyping  = role === "typing";
  const avatarSrc = PERSONA_AVATARS[personaId] ?? null;

  return (
    <div
      className={`message-bubble ${isUser ? "user" : "assistant"}${isTyping ? " typing" : ""}`}
      aria-label={isUser ? "Your message" : `${personaName ?? "Assistant"} message`}
    >
      {/* Photo avatar shown for assistant messages */}
      {!isUser && (
        <div className="bubble-avatar" aria-hidden="true">
          {avatarSrc ? (
            <img src={avatarSrc} alt={personaName ?? "Assistant"} className="bubble-avatar-img" />
          ) : (
            <span className="bubble-avatar-fallback">🤖</span>
          )}
        </div>
      )}

      <div className="bubble-body">
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
          ) : isUser ? (
            content
          ) : (
            <ReactMarkdown>{content}</ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
}

