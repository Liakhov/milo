# MILO — My Intelligent Life Operator

> A personal AI assistant that lives in Telegram.
> Talks like a friend. Short, honest, with a light touch of humor.

---

## What MILO does now

- 💬 **Answers text messages** — via Claude Haiku 4.5 through Telegram
- 🧠 **Has personality** — direct, warm, no corporate fluff

## What MILO will do

- 📞 **Make phone calls** — book appointments at salons, doctors, restaurants
- 📅 **Manage calendar** — create, read and find free slots in Google Calendar
- 🎙️ **Understand voice** — transcribe Telegram voice messages via Whisper
- 💪 **Track fitness** — log workouts, track PRs, monitor progress
- 🧠 **Remember everything** — contacts, preferences, past decisions
- ✅ **Verify results** — never say "done" unless it actually is

---

## Character

MILO is not a bot. He's the friend who actually picks up the phone when you need something done.

- Speaks directly — no filler words, no "Great question!"
- Remembers what matters — your doctor's name, that you hate early meetings
- Occasionally funny — but only when it fits
- Honest about failures — if something didn't work, he says so

```
You:   "Book me a haircut for Friday"
MILO:  "Done. Style at 11:00. Confirmed."

You:   "What do I have tomorrow?"
MILO:  "Morning call at 9, gym at 18. Pretty chill day."

You:   "Did the doctor appointment go through?"
MILO:  "Tried twice. They're not picking up. Want me to try again later?"
```

---

## Stack

| Component | Technology |
|---|---|
| Runtime | Node.js + tsx |
| Telegram Bot | Grammy |
| LLM | Claude Haiku 4.5 |
| Anthropic SDK | `@anthropic-ai/sdk` |

### Planned

| Component | Technology |
|---|---|
| Speech-to-Text | OpenAI Whisper API |
| Phone calls | Vapi.ai |
| Google Calendar | MCP server |
| Gmail | MCP server |
| Storage | SQLite |
| Deploy | Docker + VPS |

---

## Architecture

Current: Telegram → Claude Haiku → response.

Planned:

```
Telegram (text / voice)
        ↓
   Whisper STT          ← voice only
        ↓
 Context Builder        ← SOUL + skill headers + summary + last 5 msgs [cached]
        ↓
    Router              ← Claude Haiku, 1 call, ~50 tokens output
        ↓
┌──────┬──────┬──────┬──────┐
│ Cal  │Phone │Fit   │  QA  │  ← specialized agents, max 2 turns each
└──┬───┴──┬───┴──┬───┴──┬───┘
   │      │      │      │
   └──────┴──────┴──────┘
              ↓
          Verifier       ← code check (calendar/fitness) or LLM check (phone)
              ↓
   Telegram response + memory update
```

---

## Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Fill in TELEGRAM_BOT_TOKEN and ANTHROPIC_API_KEY

# Run in dev mode
npm run dev
```

---

## Roadmap

**MVP**
- [x] Telegram bot with text input
- [x] Claude Haiku integration with system prompt
- [ ] Whisper STT for voice messages
- [ ] Router agent
- [ ] Calendar agent + MCP
- [ ] QA agent
- [ ] Basic memory (summary + tail-5)

**v1**
- [ ] Phone agent via Vapi
- [ ] Verifier for calendar and phone
- [ ] Fitness agent + MD tracking
- [ ] Prompt caching
- [ ] Docker deploy

**v2**
- [ ] TELOS files (GOALS, MISSION, PROJECTS)
- [ ] learned.md — MILO writes what he discovered
- [ ] Web editor for skills
- [ ] Proactive mode (heartbeat, reminders)
- [ ] Voice responses via TTS

---

## Design decisions

**Why Raw API instead of Claude Agent SDK?**
Full control over context, caching and token costs. Agent SDK causes context accumulation on every iteration — tested and confirmed expensive. Router + specialized agents pattern gives the same capability at lower cost.

**Why Markdown files for skills/memory?**
Human-readable and editable from anywhere. Changes apply on the next message without redeploy.

**Why specialized agents instead of one big agent?**
A calendar agent with 2 tools costs ~300 tokens. One agent with 10 tools costs ~3000 tokens on every request. Specialization is the main cost optimization.

---

## License

MIT