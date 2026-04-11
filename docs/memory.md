# Memory

MILO has two memory layers — SQLite for conversation history, Markdown files for long-term personal data.

## SQLite — conversation history

Stores every message per chat. Used to build the recent context window.

```sql
messages(chat_id, role, content, created_at)
```

The last N messages are included in context. Managed by `db.ts`.

## Markdown files — long-term memory

Read and written by MILO via `read_data` / `write_data` tools during conversations.

```
user/
├── SOUL.md                  MILO's personality, rules, timezone
└── memory/
    └── fitness/
        ├── profile.md       Body stats, injuries, goals, PRs
        ├── program.md       Current training plan
        ├── workouts.md      Workout log (append-only)
        └── weight.md        Body weight log (append-only)
```

## How memory updates

- **Via tools** — MILO reads/writes files through `read_data` and `write_data` tool calls during the agent loop. Skills instruct the model when and how to update each file.
- **Direct file edit** — edit any file in `user/` directly. Changes apply on the next message.

## Context caching

Parts of context that don't change often are cached with Anthropic's prompt caching (90% cost reduction on cache hits).

```
Cached:      SOUL.md, skill headers
Not cached:  recent messages, current message
```
