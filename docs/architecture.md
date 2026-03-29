# Architecture

## Overview

MILO uses a single agent loop — no fixed routing. Claude reads the message, decides which tools to call, executes them step by step, and replies when done.

```
Input → STT? → Context → Agent loop → Verifier → Reply + Memory
```

## Request flow

**1. Input**
Text messages go directly to context. Voice messages go through Whisper first.

**2. Context builder**
Assembles everything Claude needs before calling the API:
- `SOUL.md` — MILO's personality and rules
- Skill headers — name + description from each `SKILL.md` (Tier 1, cached)
- Conversation summary — compressed history (cached)
- Last 5 messages — recent context

If Claude needs a specific skill, `context.ts` loads the full `SKILL.md` plus any user data files referenced inside it.

**3. Agent loop**
Claude receives context + available tools. It decides which tools to call and in what order. Each tool call is one turn.

Limits: `max_turns = 5`, `max_budget_usd = 0.02`

**4. Verifier**
After the agent finishes, we verify the result:
- Calendar → check event exists in Google API
- Phone → LLM reads transcript and confirms goal was reached
- Search → check response contains an answer
- QA → skip

On failure: 1 retry, then honest error message.

**5. Reply + memory update**
Send reply to Telegram. Save message to SQLite. Update MD files if needed. Rebuild summary every 20 messages.

## Why no router

A dedicated routing step costs ~200 tokens and adds latency. Claude with tools figures out what to do on its own. For ambiguous requests, asking for clarification is better than routing incorrectly.

## Why Raw API over Agent SDK

Full control over context, caching and turn limits. Agent SDK accumulates the full context on every iteration — expensive and hard to control. We tested this.
