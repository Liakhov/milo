# MILO — My Intelligent Life Operator

Personal AI assistant with two interfaces: **Telegram bot** and **Claude Code CLI**. Same codebase, shared `user/` data and `.claude/skills/`. One agent loop — Claude picks tools, executes steps, replies when done.

@README.md
@docs/architecture.md
@docs/structure.md

---

## Stack

- Local imports require `.js` extension (NodeNext resolution)
- Package manager: pnpm only

## Commands

```bash
pnpm dev          # tsx watch, hot reload
pnpm build        # tsc → dist/
pnpm typecheck    # type check only
pnpm start        # node dist/index.js
pnpm docker:start # docker compose up -d
```

After making changes, run `pnpm typecheck` to verify.

---

## Code rules

- Always read a file before editing it
- Prefer the simplest solution that works — no over-engineering, no premature abstractions
- Wrap agent calls in try/catch — return error to user, never crash

---

## Do not

- **NEVER read `.env` — under any circumstances, no exceptions**
- Put logic in `bot.ts` — transport only
- Call Anthropic API outside `agent.ts`
- Commit `user/` or `.env`
