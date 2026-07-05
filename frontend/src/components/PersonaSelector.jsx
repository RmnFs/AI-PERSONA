/**
 * PersonaSelector — renders one tab per persona.
 * Each tab shows an emoji avatar, the persona's display name, and a role label.
 * The active tab gets a colored glow border; clicking a non-active tab
 * triggers onSwitch(id), which resets the chat in the parent.
 */
export default function PersonaSelector({ personas, activePersona, onSwitch }) {
  const meta = {
    persona1: { emoji: "🧘", role: "Calm Mentor" },
    persona2: { emoji: "⚡", role: "Creative Sidekick" },
  };

  return (
    <div className="persona-selector" role="tablist" aria-label="Select a persona">
      {personas.map((p) => {
        const isActive = p.id === activePersona;
        const m = meta[p.id] ?? { emoji: "🤖", role: "Assistant" };
        return (
          <button
            key={p.id}
            role="tab"
            aria-selected={isActive}
            data-persona={p.id}
            className={`persona-tab${isActive ? " active" : ""}`}
            onClick={() => !isActive && onSwitch(p.id)}
            title={isActive ? `Chatting with ${p.name}` : `Switch to ${p.name}`}
          >
            <div className="tab-avatar" aria-hidden="true">
              {m.emoji}
            </div>
            <div className="tab-info">
              <span className="tab-name">{p.name}</span>
              <span className="tab-role">{m.role}</span>
            </div>
            {isActive && (
              <span className="tab-badge" aria-hidden="true">
                Active
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
