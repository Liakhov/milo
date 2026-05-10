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
├── SOUL.md                  MILO's personality and style          (milo repo)
├── SYSTEM.md                Operational rules, security, context  (milo repo)
└── memory/  →  ../milo-memory   ← symlink to the milo-memory repo
    └── fitness/
        ├── profile.md       Body stats, injuries, goals, PRs
        ├── program.md       Current training plan
        ├── workouts.md      Workout log (append-only)
        └── weight.md        Body weight log (append-only)
```

## Why memory lives in a separate repo

`user/memory/` is a symlink to a sibling clone of a **private** repo you own
(by convention named `milo-memory`) — a repo that holds only your personal
data. The split keeps:

- **Different lifecycles** — code changes on features; data changes on every
  workout. Mixing the two would flood `git log` with auto-commits.
- **Different visibility** — `milo` can be public; `milo-memory` is always
  private.
- **Different sync** — code is pulled by CI/CD on deploy; data is
  pulled/pushed by the agent itself between Mac (Claude Code) and VPS
  (Telegram bot).

In Docker, the symlink is replaced by a bind mount of the host's
`milo-memory` directory (configurable via `MEMORY_PATH`).

## How memory updates

- **Via tools** — MILO reads/writes files through `read_data` and `write_data` tool calls during the agent loop. Skills instruct the model when and how to update each file.
- **Direct file edit** — edit any file in `user/` directly (or in the
  sibling `milo-memory` repo for memory files). Changes apply on the next
  message.
- **Git sync** — commit and push from `milo-memory` to share changes between
  machines. The agent never blocks on push; pull/push is best-effort.

## Context caching

Parts of context that don't change often are cached with Anthropic's prompt caching (90% cost reduction on cache hits).

```
Cached:      SOUL.md, SYSTEM.md, skill headers
Not cached:  recent messages, current message
```
