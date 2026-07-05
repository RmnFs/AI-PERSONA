import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

/**
 * ChatWindow — scrollable message list.
 * Shows an empty-state prompt when there are no messages.
 * Auto-scrolls to the newest message (including typing indicator).
 * Passes personaId to each bubble so it can show the correct photo.
 */
const PERSONA_EMOJIS = { piyush: "🧘", hitesh: "⚡" };

export default function ChatWindow({ messages, loading, activePersona, personas }) {
  const bottomRef = useRef(null);
  const personaName  = personas.find((p) => p.id === activePersona)?.name ?? "Assistant";
  const personaEmoji = PERSONA_EMOJIS[activePersona] ?? "🤖";

  // Auto-scroll whenever messages or loading changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const isEmpty = messages.length === 0 && !loading;

  return (
    <div className="chat-window" role="log" aria-live="polite" aria-label="Chat messages">
      {isEmpty ? (
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">
            {personaEmoji}
          </div>
          <h2>Start a conversation</h2>
          <p>
            You're chatting with <strong>{personaName}</strong>. Type something below to
            begin — your conversation lives only in this tab.
          </p>
        </div>
      ) : (
        <>
          {messages.map((msg, i) => (
            <MessageBubble
              key={i}
              message={msg}
              personaName={personaName}
              personaId={activePersona}
            />
          ))}
          {loading && (
            <MessageBubble
              message={{ role: "typing", content: "" }}
              personaName={personaName}
              personaId={activePersona}
            />
          )}
        </>
      )}
      {/* Invisible sentinel for scroll anchoring */}
      <div ref={bottomRef} style={{ height: 0, flexShrink: 0 }} aria-hidden="true" />
    </div>
  );
}
