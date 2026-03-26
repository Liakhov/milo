# MILO

> My Intelligent Life Operator

A personal AI assistant that lives in Telegram and actually does things — books appointments, manages your calendar, tracks workouts, and remembers what matters.

Talks like a friend. Short, honest, occasionally funny.

---

## What it does

- 📞 Makes phone calls on your behalf
- 📅 Manages Google Calendar
- 🎙️ Understands voice messages
- 💪 Tracks workouts and progress
- 🧠 Remembers your contacts, habits and goals
- ✅ Verifies results before saying "done"

---

## Stack

- **Runtime** — Bun + TypeScript
- **Telegram** — Grammy
- **LLM** — Claude Haiku 4.5 (Anthropic)
- **STT** — OpenAI Whisper
- **Phone** — Vapi.ai
- **Calendar** — Google Calendar MCP
- **Storage** — SQLite (built-in)
- **Deploy** — Docker

---

## How it works

```
Telegram → STT → Context → Router → Agent → Verifier → Response
```

Skills are plain Markdown files mounted as a Docker volume. Edit a skill, the next message picks it up — no redeploy needed.

---

## Getting started

```bash
git clone https://github.com/yourusername/milo.git
cd milo
cp .env.example .env
bun install
docker compose up -d
```

---

## Cost

~$2–5/month on LLM at 100 requests/day. Phone calls billed separately via Vapi.

---

MIT License