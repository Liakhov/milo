# MILO

**My Intelligent Life Operator** — a personal AI assistant that lives in Telegram.

Send a text or voice message. MILO figures out what to do and does it — searches the web, books appointments, manages your calendar, tracks workouts. Talks like a friend: short, honest, occasionally funny.

---

## How it works

```mermaid
flowchart TD
    A([Telegram\ntext · voice · file]) --> B[STT — Whisper\nvoice only]
    B --> C[Context builder\nSOUL.md + skill headers · cached\nsummary + last 5 messages · cached]

    E([Skills\nSKILL.md instructions\npersonality · rules]) --> D
    C --> D[Agent loop\nClaude Haiku 4.5\nmax 5 turns · budget cap $0.02]
    D <-.loop.-> F([Tools\nweb_search · calendar\nvapi · gmail · fitness])

    D --> G[Verifier\nresult check]
    G --> H[Memory update\nSQLite + MD files]
    H --> I([Telegram reply\ntext or voice])

    style A fill:#d1f5ea,stroke:#0f6e56,color:#085041
    style I fill:#d1f5ea,stroke:#0f6e56,color:#085041
    style D fill:#eeedfe,stroke:#534ab7,color:#3c3489
    style C fill:#faeeda,stroke:#854f0b,color:#633806
    style E fill:#e6f1fb,stroke:#185fa5,color:#0c447c
    style F fill:#faece7,stroke:#993c1d,color:#712b13
    style G fill:#eaf3de,stroke:#3b6d11,color:#27500a
    style B fill:#f1efe8,stroke:#5f5e5a,color:#444441
    style H fill:#f1efe8,stroke:#5f5e5a,color:#444441
```

One agent loop — no fixed routing. Claude sees the message, picks tools, executes steps, and replies when done.

**Example — pharmacy hours:**
```
You:   "дізнайся до котрої працює аптека на Хрещатику"
Turn 1: web_search("аптека Хрещатик години роботи")
Turn 2: results received → form reply
MILO:  "Аптека на Хрещатику 22 працює до 22:00."
```

**Example — book a haircut:**
```
You:   "знайди перукарню і запишись на п'ятницю"
Turn 1: web_search("перукарня поруч")
Turn 2: make_phone_call(number, "записатись на п'ятницю")
Turn 3: create_calendar_event("Перукарня", "Friday 11:00")
MILO:  "Done. Style at 11 on Friday. Added to calendar."
```

---

## What it does

| | |
|---|---|
| 💬 | Answers questions and has conversations |
| 🔍 | Searches the web for current info |
| 📅 | Creates and reads Google Calendar events |
| 📞 | Makes phone calls and books appointments |
| 💪 | Tracks workouts and fitness progress |
| 🎙️ | Understands voice messages |
| 🧠 | Remembers your contacts, habits and goals |

---

## Stack

| Component | Technology |
|---|---|
| Runtime | Node.js + tsx |
| Telegram | grammY |
| LLM | Claude Haiku 4.5 |
| STT | OpenAI Whisper |
| Phone calls | Vapi.ai |
| Calendar / Gmail | MCP servers |
| Storage | SQLite + Markdown files |
| Deploy | Docker |

---

## Skills

Skills are plain Markdown files that tell MILO how to behave in specific domains. Edit a file — the next message picks up the change. No redeploy needed.

```
skills/
├── fitness/SKILL.md      ← how to log workouts, track PRs
├── calendar/SKILL.md     ← rules for scheduling
└── phone/SKILL.md        ← how to handle calls
```

---

## Docs

- [Structure](docs/structure.md) — file structure and data flow
- [Architecture](docs/architecture.md) — how the system works
- [Tools](docs/tools.md) — available tools and how to add new ones
- [Skills](docs/skills.md) — how to write and use skills
- [Memory](docs/memory.md) — conversation history and personal data
- [Setup](docs/setup.md) — installation and configuration
- [Cost](docs/cost.md) — pricing and optimization

---

## Setup

```bash
git clone https://github.com/yourusername/milo.git
cd milo
cp .env.example .env   # fill in API keys
npm install
npm run dev
```

---

## Status

- [x] Telegram bot (text + voice handlers)
- [x] Claude Haiku integration
- [x] SQLite message history
- [x] Prompt caching
- [ ] Whisper STT
- [ ] Web search tool
- [ ] Google Calendar tool
- [ ] Phone calls via Vapi
- [ ] Fitness tracking
- [ ] Docker deploy

---

MIT License