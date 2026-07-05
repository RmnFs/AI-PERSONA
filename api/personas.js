const fs   = require("fs");
const path = require("path");

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

module.exports = (req, res) => {
  try {
    const personas = loadPersonas();
    const list = Object.values(personas).map(({ id, name }) => ({ id, name }));
    res.status(200).json(list);
  } catch (err) {
    console.error("Error loading personas:", err);
    res.status(500).json({ error: "Failed to load personas." });
  }
};
