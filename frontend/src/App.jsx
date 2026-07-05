import { useState, useEffect } from "react";
import PersonaSelector from "./components/PersonaSelector";
import ChatWindow from "./components/ChatWindow";
import ChatInput from "./components/ChatInput";

export default function App() {
  // ── State ─────────────────────────────────────────────────────────────────
  const [personas, setPersonas]           = useState([]);
  const [activePersona, setActivePersona] = useState(null);
  const [messages, setMessages]           = useState([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);
  const [backendDown, setBackendDown]     = useState(false);

  // ── Load personas on mount ────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/personas")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((list) => {
        setPersonas(list);
        if (list.length > 0) setActivePersona(list[0].id);
      })
      .catch((err) => {
        console.error("Failed to load personas:", err);
        setBackendDown(true);
      });
  }, []);

  // ── Switch persona — resets the conversation ──────────────────────────────
  const handleSwitchPersona = (id) => {
    if (id === activePersona) return;
    setActivePersona(id);
    setMessages([]);
    setError(null);
  };

  // ── Send a message ────────────────────────────────────────────────────────
  const handleSend = async (text) => {
    if (!text || !activePersona || loading) return;

    const userMsg = { role: "user", content: text };
    const updatedMessages = [...messages, userMsg];

    setMessages(updatedMessages);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId: activePersona,
          messages: updatedMessages,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="app">
      {/* ── Header ── */}
      <header className="app-header">
        <h1>
          <span className="logo-icon" aria-hidden="true" />
          Persona Chat
        </h1>
        <span className="subtitle">Session only · No memory · No login</span>
      </header>

      {/* ── Persona tabs ── */}
      {!backendDown && personas.length > 0 && (
        <PersonaSelector
          personas={personas}
          activePersona={activePersona}
          onSwitch={handleSwitchPersona}
        />
      )}

      {/* ── Error banner ── */}
      {error && (
        <div className="error-banner" role="alert">
          <span className="error-icon" aria-hidden="true">⚠️</span>
          <span>{error}</span>
          <button
            className="error-dismiss"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* ── Chat window (or backend-down state) ── */}
      {backendDown ? (
        <div className="chat-window backend-down">
          <div className="bd-icon" aria-hidden="true">🔌</div>
          <h2>Backend not running</h2>
          <p>
            Start the Express server first, then refresh this page.
          </p>
          <p>
            In the <code>backend/</code> folder run:{" "}
            <code>node server.js</code>
          </p>
        </div>
      ) : (
        <ChatWindow
          messages={messages}
          loading={loading}
          activePersona={activePersona}
          personas={personas}
        />
      )}

      {/* ── Input ── */}
      {!backendDown && (
        <ChatInput
          onSend={handleSend}
          loading={loading}
          disabled={personas.length === 0 || !activePersona}
        />
      )}
    </div>
  );
}
