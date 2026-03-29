# Skills

Skills are Markdown files that tell MILO how to behave in specific domains. They contain instructions, rules, and references to user data — not code.

## How skills work

Claude learns about available skills through their frontmatter (Tier 1). When a request matches a skill's description, the full skill file is loaded into context along with any referenced user data files.

```
Tier 0  SOUL.md              always loaded [cached]
Tier 1  skill frontmatter    name + description [cached, ~20 tokens each]
Tier 2  full SKILL.md        loaded when skill is relevant
Tier 3  workflow .md         loaded for specific step-by-step tasks
```

No bash, no Agent SDK. `context.ts` reads the files and passes content to Claude as plain text.

## File structure

```
skills/
└── fitness/
    ├── SKILL.md
    └── workflows/
        ├── log-workout.md
        └── check-progress.md
```

## SKILL.md format

```markdown
---
name: fitness-tracker
description: Track workouts, PRs, body measurements and fitness progress.
  Use when user mentions: training, workout, gym, exercise, PR, sets, reps.
version: 1.0.0
---

## Before every response — read these files
- user/memory/fitness/profile.md
- user/memory/fitness/goals.md

## Rules
- Always compare with previous session
- Mark new PRs with a trophy emoji
- Suggest rest after 3+ consecutive training days

## Routing
| Intent          | Workflow              |
|-----------------|-----------------------|
| log workout     | log-workout.md        |
| check progress  | check-progress.md     |
| set goal        | set-goals.md          |
```

## User data references

Skills can reference personal data files in `user/memory/`. `context.ts` parses these references and loads the files automatically — Claude sees skill instructions and personal data as one block.

```
## Before every response — read these files
- user/memory/fitness/profile.md   ← body stats, 1RM, schedule
- user/memory/fitness/goals.md     ← current targets
```

## Editing skills

Skills live in `skills/` which is a Docker volume mount. Edit any file — the next message picks up the change. No redeploy needed.

To add a new skill: create a folder with a `SKILL.md` file. MILO will discover it automatically on next request.
