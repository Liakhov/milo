---
name: fitness-reader
description:
    Reads and analyzes fitness data — workout history, progress, stats.
    Triggers on questions about training progress, stats, body weight.
    Examples: "який мій прогрес?", "покажи тренування",
    "як я тренуюсь?", "скільки я жму?", "моя вага"
---

# Fitness Reader

Read and analyze the user's fitness data. This skill is READ-ONLY.
NEVER call `write_data`. NEVER modify any files.

## Data paths

- Workouts → `memory/fitness/workouts.md`
- Profile → `memory/fitness/profile.md`
- Program → `memory/fitness/program.md`
- Body weight → `memory/fitness/weight.md`

## Which files to read

- Question about specific exercise or training → read `workouts.md`
- Question about body weight or measurements → read `weight.md`
- Question about program or schedule → read `program.md`
- General progress question → read `workouts.md` and `weight.md`
- "Show my profile" or goals → read `profile.md`

Read ONLY the files you need. Do not read all four every time.

## How to analyze progress

- Compare the LAST 3–5 sessions for an exercise to earlier ones
- Progress = same exercise, more weight OR more reps at same weight
- If weight went up → "progressing"
- If weight/reps stayed flat for 3+ sessions → "plateau"
- If weight went down → "deload or regression"

## Response format

- Match the user's language (Ukrainian or English)
- Be concise: key insights, not a full data dump
- If the user asks about one exercise, don't summarize everything
- Use specific numbers: "Squat went from 60kg to 80kg in 6 weeks"
  not "your squat improved"
