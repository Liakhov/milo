# Setup

## Prerequisites

- Node.js 22+ or Bun
- Telegram bot token — create via [@BotFather](https://t.me/BotFather)
- Anthropic API key — [console.anthropic.com](https://console.anthropic.com)
- OpenAI API key — for Whisper STT
- Vapi account — for phone calls
- Google Cloud project — for Calendar and Gmail

## Local development

```bash
git clone https://github.com/yourusername/milo.git
cd milo

cp .env.example .env
# fill in your API keys

npm install
npm run dev
```

## Environment variables

```bash
# Required
TELEGRAM_BOT_TOKEN=
ANTHROPIC_API_KEY=

# For voice messages
OPENAI_API_KEY=

# For phone calls
VAPI_API_KEY=
VAPI_ASSISTANT_ID=

# For calendar and email
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth/callback
```

## Google OAuth setup

```bash
npm run auth:google
# opens browser → approve access → token saved to user/credentials/
```

Run once. Token refreshes automatically after that.

## Customize MILO

Edit `user/SOUL.md` to set MILO's personality, your name, timezone, and rules.

Edit `user/memory/MEMORY.md` to add your contacts and preferences.

Edit `user/telos/GOALS.md` to set your current goals.

## Docker deploy

```bash
docker compose up -d
```

`skills/` and `user/` are mounted as volumes — edit files directly on the server, changes apply immediately without redeploy.

To rebuild after code changes:
```bash
docker compose up -d --build
```
