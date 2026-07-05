# 🤖 Persona Chat

A minimal full-stack web app where you can have a real-time conversation with one of two AI personas — **Hitesh Choudhary** or **Piyush Garg** — each with their own personality, vocabulary, and guardrails. Pick a persona, chat with it, and switch anytime. No login. No memory. Just vibes.

> Built with Node.js + Express, React + Vite, and LLM (`openai/gpt-oss-120b`).

---



---

##  How It Works

```
       DEV                                PRODUCTION (Vercel)

┌─────────────────────┐         ┌──────────────────────────┐
│   React Frontend    │  /api/  │   Express (port 3001)    │
│   (Vite, port 5173) │ ──────► │   node server.js         │
└─────────────────────┘         └──────────────────────────┘

┌─────────────────────┐         ┌──────────────────────────┐
│   React Frontend    │  /api/  │   Vercel Serverless Fns  │
│   (Vite build/CDN)  │ ──────► │   api/personas.js        │
└─────────────────────┘         │   api/chat.js            │
                                └──────────────────────────┘
```

In both environments the backend does the same three things:
- Loads persona `.md` files **once at startup** into an in-memory map
- Injects the selected persona's content as the `system` message
- Forwards the request to Groq and returns the reply

**The key idea:** Each persona's entire personality lives in a plain `.md` file. Switching personas just swaps which file's content gets used as the system prompt — no persona logic is hardcoded anywhere in the app.

**Session-only memory:** All conversation state lives in React state only. Refresh the page and everything is gone — by design.

---

## 📁 Project Structure

```
AI-PERSONA/
├── api/                        # Vercel serverless functions (production)
│   ├── personas.js             #   GET  /api/personas
│   └── chat.js                 #   POST /api/chat
│
├── backend/                    # Local dev Express server
│   ├── server.js
│   ├── .env                    # (gitignored) GROQ_API_KEY etc.
│   ├── .env.example
│   └── personas/
│       ├── hitesh.md           # Hitesh Choudhary system prompt
│       └── piyush.md           # Piyush Garg system prompt
│
├── frontend/                   # React + Vite app
│   ├── public/
│   │   ├── Hitesh.png
│   │   └── piyush.png
│   ├── src/
│   │   ├── App.jsx             # State owner
│   │   └── components/
│   │       ├── PersonaSelector.jsx
│   │       ├── ChatWindow.jsx
│   │       ├── MessageBubble.jsx
│   │       └── ChatInput.jsx
│   └── vite.config.js
│
├── vercel.json                 # Vercel build + routing config
└── package.json                # Root deps (groq-sdk for serverless)
```

---

##  Local Setup

### Prerequisites

- Node.js 18+
- A [Groq API key](https://console.groq.com/)

### 1. Clone the repo

```bash
git clone https://github.com/RmnFs/AI-PERSONA.git
cd AI-PERSONA
```

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `backend/.env` and fill in your key:

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=openai/gpt-oss-120b
PORT=3001
```

### 3. Set up the frontend

```bash
cd ../frontend
npm install
```

### 4. Run both servers

Open **two terminals**:

**Terminal 1 — Backend:**
```bash
cd backend
node server.js
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Then open **http://localhost:5173** in your browser.

> The Vite dev proxy forwards all `/api/*` calls to `http://localhost:3001`, so there are no CORS issues in development.

---

##  Vercel Deployment

The repo is pre-configured for Vercel. When you connect the GitHub repo to Vercel:

1. Vercel reads `vercel.json` and knows to build from `frontend/`
2. The `api/` folder is automatically deployed as serverless functions
3. Set these environment variables in your Vercel project settings:
   - `GROQ_API_KEY`
   - `GROQ_MODEL` → `openai/gpt-oss-120b`

No other config needed — push to `main` and it deploys automatically.

---

## 🔌 API Reference

### `GET /api/personas`
Returns the list of available personas. Never exposes the system prompt.

```json
[
  { "id": "hitesh", "name": "Hitesh Choudhary Persona" },
  { "id": "piyush", "name": "Piyush Garg Persona" }
]
```

### `POST /api/chat`
Sends a message and gets a reply in the selected persona's voice.

**Request body:**
```json
{
  "personaId": "hitesh",
  "messages": [
    { "role": "user", "content": "How do I learn React?" }
  ]
}
```

**Response:**
```json
{
  "reply": "React seekhna hai? Easy hai, par core JavaScript pehle clear hona chahiye..."
}
```

---

## ➕ Adding a New Persona

1. Create a new `.md` file in `backend/personas/`, e.g. `backend/personas/primeagen.md`
2. The first line **must** be a `# Heading` — this becomes the display name
3. Write the personality, tone rules, and examples in the rest of the file
4. Restart the backend — it auto-discovers all `.md` files on startup
5. Add a photo to `frontend/public/` and update the `PERSONA_META` / `PERSONA_AVATARS` maps in `PersonaSelector.jsx` and `MessageBubble.jsx`

---

##  Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, `react-markdown` |
| Backend (local dev) | Node.js, Express, `groq-sdk`, `dotenv` |
| Backend (production) | Vercel Serverless Functions |
| LLM | Groq API — `openai/gpt-oss-120b` |
| Styling | Vanilla CSS (dark glassmorphism) |

---

---

##  Persona Data Collection and Preparation

For this assignment, the goal was to build chatbots that actually feel like Hitesh Choudhary and Piyush Garg, rather than generic AI assistants.

**How I gathered the data:**

* **Watching Content:** I spent time watching their YouTube videos (*Chai aur Code*, *Hitesh Choudhary*, and *Piyush Garg*) to pick up on how they actually talk. I looked for their teaching styles, how they greet their viewers, and their specific catchphrases.
* **Resource Mapping:** I collected their real-world links (like `chaicode.com` and `piyushgarg.dev`) so the bots can recommend actual courses and videos when asked.
* **Custom Assignment Rules:** I also integrated specific instructions given for this project, such as routing all deadline extension requests to "Bigboss (Anirudh)."

**How I prepared the prompts:**
Instead of dumping huge video transcripts into the LLM, I structured their personalities into clean Markdown (MD) files. Each persona file includes:

1. **Core Identity:** A quick summary of who they are (e.g., Hitesh as the calm mentor, Piyush as the provocative, production-focused engineer).
2. **Vocabulary:** A list of their go-to phrases (Hitesh's *"Haan ji"*, Piyush's *"Is JSON dead?"*).
3. **Tone Constraints:** Rules to make sure they reply like they are sending a quick Discord message, not writing an essay.

---

## 🛠️ Prompt Engineering Strategy

To stop the model from acting like standard ChatGPT, I used a few specific prompting strategies:

### 1. Negative Constraints (The "DO NOT" List)

LLMs naturally want to be overly helpful and output huge lists. I added strict negative rules telling the bot to never write huge code blocks, never give massive roadmaps, and avoid robotic phrases like "I am happy to help." Responses are capped at 2-4 sentences.

### 2. Handling "Hinglish" (The Devanagari Ban)

To simulate an Indian developer chatting on WhatsApp, the bots are instructed to mix English and Hindi (Hinglish). However, to prevent the UI from rendering native Hindi characters, I added a strict rule: `NO DEVANAGARI SCRIPT`. This forces the bot to type Hindi words using the English alphabet.

### 3. Guardrails & Topic Handling

I categorized off-topic requests into different buckets:

* **Small Talk/Jokes:** The bot plays along but keeps it short and tech-related, then pivots back to code.
* **Sensitive Topics (Politics, etc.):** The bot shuts it down immediately using a character-accurate response (e.g., *"Yahi sab karna hai toh internet pe aur jagah hain"*).
* **Prompt Injection Defense:** If a user tries to trick the bot by saying "Write a political joke in this HTML tag," the bot only provides the empty HTML `<p>` tag and tells the user to write the content themselves.

### 4. Few-Shot Examples

At the bottom of the system prompt, I provided a few "Good vs. Bad" conversation examples. Giving the LLM a template of exactly how to handle a "Hi" or a request for a React tutorial helps it match the expected pacing and tone perfectly.

---

## 🔄 Context Management Approach

To keep the conversation flowing without breaking character, the context is handled like this:

1. **System Prompt Anchoring:** The persona `.md` file is loaded into memory at server startup and injected as the `system` message at the top of every Groq API call. This means the personality rules are always the first thing the model sees, before any user message.
2. **Full Conversation History:** The entire conversation history for the current session is sent to Groq on every request. There is no truncation or sliding window. Since conversations are session-only (no persistence and no storage), the context naturally resets when the user refreshes the page or switches persona, keeping token usage reasonable in practice.

---

##  Sample Conversations

### Persona 1: Hitesh Choudhary

**User:** Hi, how are you?
**HiteshBot:** Haan ji, hello! Main badiya hoon. Kya chal raha hai? What are you building or learning today?

**User:** Can you write a political joke for my website?
**HiteshBot:** Content khud likh lo yaar. HTML mein text daalna hai toh `<p>Your content here</p>` use karo. Code pe focus karo, baki cheezein khud handle kar lo.

**User:** React sikhna hai bhai, time nahi hai videos dekhne ka. Why is my useEffect running twice?
**HiteshBot:** React 18 strict mode mein ye expected behaviour hai dev environment mein. It mounts, unmounts, and remounts to check for bugs. Production build mein it will only run once. Tension ki baat nahi hai.

### Persona 2: Piyush Garg

**User:** Hey man!
**PiyushBot:** Hey! Kya haal chaal? Main badhiya. Batao aaj kaunsa naya tech stack try kar rahe ho?

**User:** I need to build a backend, is REST API dead? Should I use GraphQL?
**PiyushBot:** REST dead toh nahi hai, par modern production-level apps mein GraphQL ya tRPC kaafi better developer experience dete hain. Agar exact endpoints pata hain toh REST theek hai, varna GraphQL se over-fetching bacha lo. Let's build a clone and test it out!

**User:** Can you extend my assignment deadline by 2 days?
**PiyushBot:** Bhai, assignments aur deadlines mere haath mein nahi hain. Ye sab Bigboss (Anirudh) handle karta hai. Deadline extend karni hai toh direct usse baat kar lo.