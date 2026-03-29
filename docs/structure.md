# Project structure

```
milo/
│
├── src/                          TypeScript source code
│   ├── index.ts                  Entry point. Initializes bot, validates env,
│   │                             handles incoming messages, orchestrates the pipeline.
│   │
│   ├── bot.ts                    Telegram transport only. Receives messages,
│   │                             parses type (text/voice/photo/document),
│   │                             passes structured object to index.ts.
│   │
│   ├── ai.ts                     Anthropic client singleton.
│   │                             Single instance used across the entire app.
│   │
│   ├── context.ts                Builds the full context before each API call.
│   │                             Loads SOUL.md, skill headers, conversation summary,
│   │                             last 5 messages. Applies prompt caching.
│   │                             Parses SKILL.md file references and loads user data.
│   │
│   ├── agent.ts                  Agent loop. Sends context + tools to Claude,
│   │                             handles tool calls, executes them, feeds results back.
│   │                             Enforces max_turns and budget cap.
│   │
│   ├── verifier.ts               Verifies results after agent finishes.
│   │                             calendar → checks event exists in Google API
│   │                             phone    → LLM reads transcript
│   │                             search   → checks response has answer
│   │                             qa       → skips verification
│   │
│   ├── memory.ts                 All read/write operations for SQLite and MD files.
│   │                             Saves messages, loads history, updates summary,
│   │                             reads and writes user/memory/ files.
│   │
│   ├── stt.ts                    Whisper integration. Downloads voice file from
│   │                             Telegram, converts .ogg → .mp3, sends to OpenAI,
│   │                             returns transcript text.
│   │
│   └── tools/
│       ├── index.ts              Tool registry. Exports definitions array for Claude
│       │                         and execute() dispatcher for tool calls.
│       │
│       ├── search.ts             web_search — Brave/Serper API
│       ├── calendar.ts           get_calendar_events, create_calendar_event
│       ├── phone.ts              make_phone_call — Vapi.ai
│       ├── fitness.ts            log_workout, get_fitness_progress
│       └── email.ts              send_email — Gmail MCP
│
├── skills/                       Markdown files — Docker volume mount
│   │                             Edit without redeploy. Loaded at request time.
│   │
│   ├── fitness/
│   │   ├── SKILL.md              Instructions, rules, file references
│   │   └── workflows/
│   │       ├── log-workout.md
│   │       ├── check-progress.md
│   │       └── set-goals.md
│   │
│   ├── calendar/
│   │   ├── SKILL.md
│   │   └── workflows/
│   │       ├── create-event.md
│   │       └── check-schedule.md
│   │
│   └── phone/
│       ├── SKILL.md
│       └── workflows/
│           └── make-appointment.md
│
├── user/                         Personal data — Docker volume mount
│   │                             Never committed to git. Never overwritten on deploy.
│   │
│   ├── SOUL.md                   MILO's personality, rules, timezone, user name
│   │
│   ├── telos/
│   │   ├── GOALS.md              Current life goals
│   │   └── PROJECTS.md           Active projects
│   │
│   └── memory/
│       ├── MEMORY.md             Contacts, preferences, general facts
│       ├── summary.md            Auto-updated conversation summary
│       ├── learned.md            Things MILO discovered over time
│       └── fitness/
│           ├── profile.md        Body stats, 1RM, schedule, injuries
│           ├── workouts.md       Workout log
│           ├── progress.md       Current results and PRs
│           └── goals.md          Fitness goals
│
├── docs/                         Documentation
│   ├── architecture.md
│   ├── tools.md
│   ├── skills.md
│   ├── memory.md
│   ├── setup.md
│   ├── cost.md
│   └── structure.md              ← this file
│
├── .env.example                  Environment variable template
├── .gitignore                    Excludes user/, .env, node_modules
├── docker-compose.yml
├── Dockerfile
├── package.json
├── tsconfig.json
└── README.md
```

## Key separation

```
src/      code — rebuilt on deploy
skills/   agent instructions — edited live, no redeploy
user/     personal data — never touched by deploys
```

## Data flow between files

```
index.ts
  → bot.ts         parse incoming message
  → stt.ts         transcribe if voice
  → context.ts     build prompt (reads SOUL.md, skills/, memory/)
  → agent.ts       run Claude with tools
      → tools/*    execute tool calls
  → verifier.ts    check result
  → memory.ts      save to SQLite + update MD files
  → bot.ts         send reply
```