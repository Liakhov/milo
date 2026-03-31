# MILO — My Intelligent Life Operator

Personal AI assistant in Telegram. One agent loop — Claude picks tools, executes steps, replies when done.

@README.md
@docs/architecture.md
@docs/structure.md

---

## Stack

- Node.js 24 + TypeScript, ESM (`"type": "module"`)
- Module resolution: NodeNext — local imports require `.js` extension
- Package manager: pnpm only
- Telegram: grammY · LLM: Claude Haiku 4.5 · STT: Whisper · DB: sql.js

## Commands

```bash
pnpm dev          # tsx watch, hot reload
pnpm build        # tsc → dist/
pnpm start        # node dist/index.js
pnpm typecheck    # type check only
pnpm docker:start # docker compose up -d
```

---

## Code rules

```typescript
// Local imports — always .js (ESM)
import { bot } from "./bot.js"

// Entry point — always first line
import "dotenv/config"
```

- No `any` types, no `.then()` chains — use `async/await`
- Wrap agent calls in try/catch — return error to user, never crash

---

## Architecture

```
bot.ts       → parse message, pass to index.ts (transport only, no logic)
index.ts     → orchestrate pipeline
context.ts   → build prompt: SOUL.md + skill headers + summary + last 5 msgs
agent.ts     → Claude loop, max 5 turns, budget $0.02, execute tools
verifier.ts  → check result before replying
memory.ts    → SQLite + MD file operations
```

**No router** — Claude with tools figures out intent on its own.
**Raw API** — full control over context and caching. Agent SDK accumulates context = expensive.
**Skills = instructions** — SKILL.md loads into context, tells Claude how to behave.
**Tools = actions** — always available regardless of active skill.

---

## Skills

Plain Markdown in `skills/`. Loaded via `fs.readFileSync` — no bash, no Agent SDK.

```
Tier 1  frontmatter only     always cached (~20 tokens each)
Tier 2  full SKILL.md        when skill is relevant
Tier 3  workflow .md         for step-by-step tasks
```

To add a skill: create `skills/name/SKILL.md` with `name` and `description` frontmatter. Auto-discovered.

---

## Tools

TypeScript functions in `src/tools/`. Each exports `definition` (schema) and `execute` (logic).
To add a tool: create file, register in `src/tools/index.ts`. Claude knows about it on next restart.

---

## Do not

- Put logic in `bot.ts` — transport only
- Call Anthropic API outside `agent.ts`
- Use `require()` — ESM only
- Commit `user/` or `.env`
- Import skills — read them with `fs.readFileSync` at runtime