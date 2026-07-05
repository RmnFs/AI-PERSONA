const fs   = require("fs");
const path = require("path");
const Groq = require("groq-sdk");

// Load persona files from backend/personas/ relative to repo root
function loadPersonas() {
  const dir = path.join(process.cwd(), "backend", "personas");
  const personas = {};

  fs.readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .forEach((filename) => {
      const id  = filename.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(dir, filename), "utf-8");
      const firstLine = raw.split("\n")[0] ?? "";
      const name = firstLine.startsWith("#")
        ? firstLine.replace(/^#+\s*/, "").trim()
        : id;
      personas[id] = { id, name, systemPrompt: raw };
    });

  return personas;
}

const groq  = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

module.exports = async (req, res) => {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed." });
  }

  const { personaId, messages } = req.body;
  const personas = loadPersonas();

  // Validate
  if (!personaId || !personas[personaId]) {
    return res.status(400).json({
      error: `Unknown personaId "${personaId}". Valid ids: ${Object.keys(personas).join(", ")}`,
    });
  }
  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: '"messages" must be an array.' });
  }

  const { systemPrompt } = personas[personaId];

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    });

    const reply = completion.choices[0]?.message?.content ?? "";
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Groq API error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
};
