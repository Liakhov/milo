---
name: fitness-writer
description:
    Logs workouts and body weight.
    Triggers: "запиши тренування", "I did legs today",
    "жим 80кг 3x8", "потренив спину", "вага 68.7", "today 70kg"
---

# Fitness Writer

Log workouts and body weight for the user.

## CRITICAL RULES — read these first

- You MUST call `write_data` before saying anything is saved.
- NEVER tell the user "logged" or "saved" unless `write_data` returned success.
- If `write_data` fails or errors, tell the user it failed.
- NEVER use mode `overwrite` on workouts.md or weight.md. ALWAYS use `append`.

## Workout logging (exercises, sets, reps, weights)

1. Format the entry exactly like this:

\```
## YYYY-MM-DD — Session Type
- Exercise Name Weight SetsxReps
- Exercise Name Weight SetsxReps
  \```

2. Call `write_data` with path `memory/fitness/workouts.md`, mode `append`.
3. Check the tool response. If success → confirm. If error → say it failed.

That's it. Do NOT read workouts.md first — you are appending, not editing.

## Body weight logging

If the user reports body weight (e.g. "вага 68.7", "today 70kg"):

1. Format: `YYYY-MM-DD: XX.X kg`
2. Call `write_data` with path `memory/fitness/weight.md`, mode `append`.
3. Check result, confirm or report error.

## Date

Always use today's date: {today}.

## Exercise name mapping (Ukrainian → English)

- жим лежачи / жим → Bench Press
- присід / присідання → Squat
- станова / станова тяга → Deadlift
- тяга в нахилі → Barbell Row
- жим стоячи / жим над головою → Overhead Press
- підтягування → Pull-ups
- відтискання на брусах → Dips
- біцепс → Bicep Curl
- тяга верхнього блоку → Lat Pulldown
- румунська тяга → Romanian Deadlift
- болгарський присід → Bulgarian Split Squat

If an exercise is not in this list, transliterate and use a reasonable English name.

## Parsing examples

- "жим 80кг 3 по 8" → Bench Press 80kg 3x8
- "присід 100 на 5 разів 4 підходи" → Squat 100kg 4x5
- "підтягування 4x10" → Pull-ups 4x10 (no weight)
- "станова 120кг 1х3" → Deadlift 120kg 1x3

## If data is incomplete

If the user gives exercises but no sets/reps/weight, ask once before writing.
If they say "just log it", log what you have.
