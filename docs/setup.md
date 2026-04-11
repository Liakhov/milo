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
- OpenAI API key — for gpt-4o-mini-transcribe STT (voice messages only)

## Local development

```bash
git clone https://github.com/yourusername/milo.git
cd milo

cp .env.example .env
# fill in your API keys

cp user/SOUL.example.md user/SOUL.md
# customize personality

pnpm install
pnpm dev
```

## Environment variables

```bash
# Required
TELEGRAM_BOT_TOKEN=
ANTHROPIC_API_KEY=
ALLOWED_USER_IDS=        # comma-separated Telegram user IDs

# For voice messages
OPENAI_API_KEY=
```

## Customize MILO

Edit `user/SOUL.md` to set MILO's personality, your name, timezone, and rules.

## Docker deploy

```bash
docker compose up -d
```

`user/` is mounted as a volume — edit files directly on the server, changes apply immediately without redeploy.

To rebuild after code changes:
```bash
docker compose up -d --build
```
