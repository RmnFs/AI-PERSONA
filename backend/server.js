import "dotenv/config";
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Groq from "groq-sdk";

// ── Path helpers (ESM) ────────────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Load personas from disk at startup ────────────────────────────────────────
const personasDir = path.join(__dirname, "personas");
const personas = {};

fs.readdirSync(personasDir)
  .filter((f) => f.endsWith(".md"))
  .forEach((filename) => {
    const id = filename.replace(/\.md$/, "");
    const raw = fs.readFileSync(path.join(personasDir, filename), "utf-8");

    // First line must be "# Display Name"
    const firstLine = raw.split("\n")[0] ?? "";
    const name = firstLine.startsWith("#")
      ? firstLine.replace(/^#+\s*/, "").trim()
      : id;

    personas[id] = { id, name, systemPrompt: raw };
  });

console.log(
  `✅ Loaded ${Object.keys(personas).length} persona(s):`,
  Object.values(personas).map((p) => `"${p.name}" (${p.id})`)
);

// ── Groq client ───────────────────────────────────────────────────────────────
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

// ── Express app ───────────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// ── GET /api/personas ─────────────────────────────────────────────────────────
// Returns [{id, name}] — never exposes systemPrompt to the client.
app.get("/api/personas", (_req, res) => {
  const list = Object.values(personas).map(({ id, name }) => ({ id, name }));
  res.json(list);
});

// ── POST /api/chat ────────────────────────────────────────────────────────────
// Body: { personaId: string, messages: [{role, content}] }
// Returns: { reply: string }
app.post("/api/chat", async (req, res) => {
  const { personaId, messages } = req.body;

  // ── Validation ──
  if (!personaId || !personas[personaId]) {
    return res.status(400).json({
      error: `Unknown personaId "${personaId}". Valid ids: ${Object.keys(personas).join(", ")}`,
    });
  }
  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: '"messages" must be an array.' });
  }

  const { systemPrompt } = personas[personaId];

  // ── Groq call ──
  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    const reply = completion.choices[0]?.message?.content ?? "";
    return res.json({ reply });
  } catch (err) {
    console.error("Groq API error:", err);
    return res
      .status(500)
      .json({ error: "Something went wrong. Please try again." });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
