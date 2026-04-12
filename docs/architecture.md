# Architecture

## Overview

MILO uses a single agent loop — no fixed routing. Claude reads the message, decides which tools to call, executes them step by step, and replies when done.

Two interfaces share the same codebase and data:
- **Telegram bot** — text + voice messages, runs via `pnpm dev` or Docker
- **Claude Code CLI** — direct access to the same skills and `user/` data

```
Input → STT? → Context → Agent loop → Reply + Save
```

## Request flow (Telegram)

**1. Input**
Text messages go directly to context. Voice messages go through gpt-4o-mini-transcribe first.

**2. Context builder**
Assembles everything Claude needs before calling the API:
- `SOUL.md` — MILO's personality and style
- `SYSTEM.md` — operational rules (tool usage, data paths, context)
- Skill headers — name + description from each `SKILL.md`
- Conversation history from SQLite

If Claude activates a skill, `context.ts` loads the full `SKILL.md` on the next turn.

**3. Agent loop**
Claude receives context + available tools. It decides which tools to call and in what order. Each tool call is one turn.

- Custom tools (`read_data`, `write_data`) — executed locally, results fed back
- Server tools (`web_search`) — executed by Anthropic automatically

Limit: `max_turns = 10`

**4. Reply + save**
Send reply to Telegram. Save message to SQLite.

## Claude Code mode

When used via Claude Code CLI, the same skills in `.claude/skills/` are available as slash commands. The `user/memory/` files are shared — data written by the Telegram bot is visible in Claude Code and vice versa.

## Why no router

A dedicated routing step costs ~200 tokens and adds latency. Claude with tools figures out what to do on its own. For ambiguous requests, asking for clarification is better than routing incorrectly.

## Why Raw API over Agent SDK

Full control over context, caching and turn limits. Agent SDK accumulates the full context on every iteration — expensive and hard to control.
