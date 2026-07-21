# Setup

## Two modes

MILO works in two modes from the same codebase:

- **Telegram app** — run `pnpm dev` or deploy via Docker. MILO responds to messages in Telegram (text + voice).
- **Claude Code** — use Claude Code CLI in this repo. Skills in `.claude/skills/` and data in `user/memory/` are shared between both modes.

Both modes read from the same `user/` directory — data written by the Telegram bot is visible to Claude Code and vice versa.

## Prerequisites

- Node.js 22+
- pnpm
- Telegram bot token — create via [@BotFather](https://t.me/BotFather)
- Anthropic API key — [console.anthropic.com](https://console.anthropic.com)
- OpenAI API key — optional, for gpt-4o-mini-transcribe STT (voice messages only)

## Local development

### Step 1 — create your private memory repo

Memory holds your personal data, so it lives in a **private** repo you own
(not the public `milo` repo). Create an empty private repo on your Git host
(e.g. `<your-user>/milo-memory` on GitHub).

### Step 2 — clone both repos as siblings

```bash
git clone https://github.com/Liakhov/milo.git
git clone git@github.com:<your-user>/milo-memory.git

cd milo
ln -s ../milo-memory user/memory     # symlink for local dev

cp .env-example .env                 # fill in API keys and Telegram access settings
# edit user/SOUL.md and user/SYSTEM.md to customize

pnpm install
pnpm dev
```

### Why two repos

`milo` is the engine — code, skills, system prompts. `milo-memory` is your
personal data — markdown files written by the agent (workouts, weight,
profile). They evolve independently:

- `milo` changes on feature work; reviewed commits, can be public.
- `milo-memory` changes on every workout you log; auto-commits, must be private.

The symlink lets the running app read/write `user/memory/...` paths without
caring that the data lives in a different repo.

## Environment variables

```bash
# Required
TELEGRAM_BOT_TOKEN=
ANTHROPIC_API_KEY=
PUBLIC_MODE=false        # set true only to intentionally allow everyone
ALLOWED_USER_IDS=12345678 # comma-separated positive numeric Telegram user IDs

# Optional: enables voice messages. Text messages work without it.
OPENAI_API_KEY=
```

When `OPENAI_API_KEY` is omitted, MILO starts in text-only mode. Voice messages
receive an explanation that voice support is disabled; all text functionality
continues to work normally.

### Telegram access control

MILO is private by default. With `PUBLIC_MODE=false` (or omitted),
`ALLOWED_USER_IDS` must contain at least one valid numeric Telegram user ID;
otherwise startup fails.

Set `PUBLIC_MODE=true` only to intentionally allow every Telegram user. Invalid
values in either setting are always rejected during startup.

## Customize MILO

- Edit `user/SOUL.md` to set MILO's personality and communication style.
- Edit `user/SYSTEM.md` to set operational rules, security, and context (timezone, language). Domain-specific paths and procedures live in `.claude/skills/*/SKILL.md`.

## Docker deploy

On the host, clone both repos side by side:

```
/srv/milo/         ← this repo (code)
/srv/milo-memory/  ← memory repo (data)
```

```bash
cd /srv/milo
docker compose up -d
```

`user/memory/` is bind-mounted from the sibling `milo-memory` directory.
Override the source path via `MEMORY_PATH` in `.env` if your layout differs:

```
MEMORY_PATH=/srv/milo-memory
```

Default (when unset) is `../milo-memory` relative to `compose.yaml`.

`user/` (without `memory/`) is mounted live — edit `SOUL.md` / `SYSTEM.md`
on the server and changes apply on the next message without redeploy.

To rebuild after code changes:
```bash
docker compose up -d --build
```
