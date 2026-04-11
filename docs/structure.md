# Project structure

```
milo/
│
├── src/                          TypeScript source code
│   ├── index.ts                  Entry point. Validates env, handles messages,
│   │                             orchestrates the pipeline.
│   │
│   ├── bot/
│   │   ├── index.ts              Telegram transport. Receives messages,
│   │   │                         parses type (text/voice/photo/document).
│   │   ├── middleware.ts         Access control, rate limiting.
│   │   └── utils.ts              Message parsing helpers.
│   │
│   ├── ai.ts                    Anthropic client singleton.
│   │
│   ├── context.ts               Builds the full context before each API call.
│   │                            Loads SOUL.md, skill headers, conversation history.
│   │                            Applies prompt caching.
│   │
│   ├── agent.ts                 Agent loop. Sends context + tools to Claude,
│   │                            handles tool_use (custom) and server_tool_use (built-in),
│   │                            feeds results back. Enforces max_turns.
│   │
│   ├── db.ts                    SQLite database (better-sqlite3, WAL mode).
│   │
│   ├── env.ts                   Environment variable validation and access.
│   │
│   ├── logger.ts                Structured logging (JSONL daily files + console).
│   │
│   ├── stt.ts                   STT via gpt-4o-mini-transcribe. Downloads voice from Telegram,
│   │                            converts .ogg → .mp3, returns transcript.
│   │
│   └── tools/
│       ├── index.ts             Tool registry. Exports definitions for Claude
│       │                        and executeTool() dispatcher.
│       │
│       └── data.ts              read_data + write_data — generic file tools
│                                scoped to user/memory/.
│
├── .claude/
│   └── skills/                  Markdown skill files (hot-swappable logic).
│       ├── fitness-planner/     Training program creation.
│       ├── fitness-reader/      Workout analysis and progress review.
│       ├── fitness-writer/      Workout logging and PR tracking.
│       └── health-buddy/       Well-being nudges (burnout, fatigue).
│
├── user/                        Personal data (volume mount, git-ignored).
│   ├── SOUL.md                  MILO's personality, rules, timezone, user name.
│   └── memory/
│       └── fitness/
│           ├── profile.md       Body stats, injuries, goals, PRs.
│           ├── program.md       Current training plan.
│           ├── workouts.md      Workout log (append-only).
│           └── weight.md        Body weight log (append-only).
│
├── docs/                        Documentation
│   ├── architecture.md
│   ├── tools.md
│   ├── skills.md
│   ├── memory.md
│   ├── setup.md
│   ├── cost.md
│   └── structure.md             ← this file
│
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

## Key separation

```
src/           code — rebuilt on deploy
.claude/skills agent instructions — edited live, no redeploy
user/          personal data — never touched by deploys
```

## Tools architecture

Two generic tools, both scoped to `user/memory/`:
- `read_data` — reads any file by path
- `write_data` — writes/appends to any file by path
- `web_search` — Anthropic server tool (executed server-side)

Custom tools are executed locally in the agent loop. Server tools (web_search) are handled by Anthropic automatically.

## Data flow

```
index.ts
  → bot/          parse incoming message
  → stt.ts        transcribe if voice
  → context.ts    build prompt (reads SOUL.md, skills/, history)
  → agent.ts      run Claude with tools
      → tools/*   execute custom tool calls
  → db.ts         save to SQLite
  → bot/          send reply
```
