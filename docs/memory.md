# Memory

MILO has two memory layers — SQLite for conversation history, Markdown files for long-term personal data.

## SQLite — conversation history

Stores every message per chat. Used to build the recent context window.

```sql
messages(chat_id, role, content, created_at)
```

The last 5 messages are always included in context. Older messages are compressed into a summary.

## Summary — compressed history

Every 20 messages, Haiku compresses old conversation history into ~5 sentences. This keeps the context window small without losing important facts.

```
messages 1-15  →  summary.md  (5 sentences, cached)
messages 16-20 →  included as-is
message 21     →  triggers new summary
```

## Markdown files — long-term memory

```
user/
├── SOUL.md                  MILO's personality, rules, timezone
├── memory/
│   ├── MEMORY.md            contacts, preferences, general facts
│   ├── summary.md           auto-updated conversation summary
│   ├── learned.md           things MILO discovered over time
│   └── fitness/
│       ├── profile.md       body stats, 1RM, training schedule
│       ├── workouts.md      workout log
│       ├── progress.md      current results and PRs
│       └── goals.md         fitness goals
└── telos/
    ├── GOALS.md             life goals
    └── PROJECTS.md          active projects
```

## Updating memory

**Automatically** — MILO updates `workouts.md`, `progress.md` and `learned.md` after relevant actions.

**Via Telegram command** — for quick manual updates:
```
/memory "новий лікар: Dr. Шевченко +380671234567"
```

**Direct file edit** — edit any file in `user/` directly. Changes apply on the next message.

## Context caching

The parts of context that don't change often are cached with Anthropic's prompt caching. You pay 10% of normal cost on repeated requests.

```
Cached:      SOUL.md, skill headers, summary
Not cached:  last 5 messages, current message
```
