---
name: fitness-planner
description:
    Creates training programs and suggests what to train next.
    Triggers: "сплануй тренування", "create a program",
    "що тренувати?", "програма на тиждень", "what to train next"
---

# Fitness Planner

Create, adjust, or review the user's training program.

## CRITICAL RULES

- NEVER call `write_data` unless the user confirms they want to save.
- If you call `write_data`, use path `memory/fitness/program.md`, mode `overwrite`.
- Check `write_data` response before confirming save.

## Which files to read

- "What to train today/next?" → read `program.md` and `workouts.md`
- "Create a new program" → read `profile.md` and `workouts.md`
- "Adjust my program" → read `program.md` and `profile.md`

Read ONLY what you need.

## Before generating a plan

Check if you know:
1. How many days per week
2. Where they train (gym / home)
3. Any injuries or limitations

If clear from data or conversation → generate immediately.
If not → ask ONE short question covering what's missing.

Fallback if user says "just make something":
- 3 days/week, gym, full body, no injuries, hypertrophy focus.

## Program design

### Split selection
- 3 days/week → Full Body
- 4 days/week → Upper / Lower
- 5+ days/week → Push / Pull / Legs

### Session structure
- 5–7 exercises per session
- Compound movements first, isolation last
- Include rest times: 90–120s for compounds, 60–90s for isolation

### Rep ranges
- Strength → 3–5 reps
- Hypertrophy → 8–12 reps (default)
- Endurance → 15+

### Progression
- Suggest a simple progression scheme:
  "When you complete all sets at the top of the rep range,
  add 2.5kg (upper body) or 5kg (lower body) next session."

### Periodization
- Every 4–6 weeks suggest a deload week (reduce volume by 40–50%).
- Note this in the program footer, not in every session.

## Express version

If the user has a busy or inconsistent schedule, add a short
fallback workout after the main program:
- 15–20 minutes
- 3 compound exercises, 3 sets each
- Label it "Express — if short on time"

Only include if relevant (user mentioned time constraints or
inconsistent schedule in profile/conversation).

## Technique tips

For compound lifts only (squat, deadlift, bench, OHP, row),
add one short tip per exercise focused on safety or common mistakes.
Format: `Note: [tip]` under the exercise.

Do NOT add tips to isolation exercises or accessories.

## If a program already exists

Read `program.md` first.
- If user asks for adjustment → modify only what they asked.
  Do NOT rewrite the full program for a small change.
- If user asks for a new program → replace entirely.
- If the existing program has no recent progress (same weights for 3+ weeks
  in workouts.md), suggest adjustments proactively.
- If unclear → ask: "adjust current or start fresh?"

## Validation — check before presenting

Before showing the plan, verify:
- No exercises hit the same muscle group on consecutive days
- Total sets per muscle group per week: 10–20 (not more, not less)
- All exercises are possible with user's available equipment
- Injuries/limitations are respected — no contraindicated movements
- Session fits the user's time (default 45–60 min)

If something fails → fix it silently and present the corrected version.
Do NOT show the user what you fixed unless it changes their request.

## Output format

```
# Program — [Goal]

## Day 1 — [Type]
- Exercise — Sets x Reps (Rest: Xs)
  Note: [technique tip if compound]
- Exercise — Sets x Reps (Rest: Xs)

## Day 2 — [Type]
- Exercise — Sets x Reps (Rest: Xs)

---

Progression: add weight when you hit the top of the rep range
for all sets.
Deload: every 4–6 weeks, cut volume by half for one week.
```

No emoji. Clean markdown.

## Saving

After presenting, ask: "Save as your program?"
- Yes → `write_data`, path `memory/fitness/program.md`, mode `overwrite`
- No → done

## Language

Match the user's language (Ukrainian or English).
