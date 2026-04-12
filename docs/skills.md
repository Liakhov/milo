# Skills

Skills are Markdown files that tell MILO how to behave in specific domains. They contain instructions and rules — not code.

## How skills work

1. On every request, `context.ts` loads skill frontmatter (name + description) into the system prompt.
2. Claude reads the user's message and decides if a skill is needed.
3. If yes, Claude outputs the skill name (e.g. `/fitness-planner`), which `agent.ts` detects.
4. On the next turn, the full SKILL.md is loaded into context.
5. Claude follows the skill's instructions, calling tools as needed.

```
Tier 0  SOUL.md + SYSTEM.md  always loaded (personality + operational rules)
Tier 1  skill frontmatter    name + description (loaded on every request)
Tier 2  full SKILL.md        loaded when skill is activated
```

## File structure

```
.claude/skills/
├── fitness-planner/
│   └── SKILL.md
├── fitness-reader/
│   └── SKILL.md
├── fitness-writer/
│   └── SKILL.md
└── health-buddy/
    └── SKILL.md
```

## SKILL.md format

```markdown
---
name: fitness-writer
description:
    Logs workouts and updates fitness data.
    Triggers when user reports training — exercises, sets, reps, weights.
    Examples: "запиши тренування", "I did legs today", "жим 80кг 3x8"
---

# Fitness Writer

You help the user log workouts and update fitness records.

## Steps

1. Call `read_data` for relevant files.
2. Process the user's input.
3. Call `write_data` to save results.
4. Confirm what was done.

## Rules

- Always use today's date.
- Never overwrite workouts.md — always append.
```

Key points:
- **Frontmatter** `name` and `description` are used for skill detection — keep descriptions clear with trigger examples.
- **Steps** tell the model what tools to call and in what order.
- **Rules** constrain behavior (e.g. append vs overwrite).

## Editing skills

Skills live in `.claude/skills/`. Edit any SKILL.md — the next message picks up the change. No redeploy needed.

To add a new skill: create a folder with a `SKILL.md` file under `.claude/skills/`. MILO discovers it automatically on next request.
